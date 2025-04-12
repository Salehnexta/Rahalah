"""
Dependency Analysis Script for Rahalah

This script performs a thorough analysis of the Rahalah codebase to identify which files
are essential for the system to function properly. It does this by:

1. Analyzing imports in Python files
2. Examining HTML templates for script and style includes
3. Checking JavaScript files for dependencies
4. Identifying key configuration files
5. Testing the functionality of the system with and without certain files

This helps determine which files in the root directory can be safely removed without
affecting core functionality.
"""

import os
import re
import sys
import json
import importlib
import subprocess
import ast
from typing import Dict, List, Set, Tuple

# Add root directory to path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(ROOT_DIR)

# Configure paths
BACKUP_DIR = os.path.join(ROOT_DIR, "dependency_backups")
os.makedirs(BACKUP_DIR, exist_ok=True)

# Files that should never be removed
CRITICAL_FILES = {
    "server.py",
    ".env",
    "requirements.txt",
    "package.json",
    "package-lock.json"
}

# Directories that should never be removed
CRITICAL_DIRS = {
    "agents",
    "templates",
    "static",
    "js",
    "css",
    "utils",
    "images"
}

def get_python_imports(file_path: str) -> Set[str]:
    """Extract all imports from a Python file."""
    imports = set()
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        try:
            # Parse the file with ast
            tree = ast.parse(content)
            
            # Find all import statements
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for name in node.names:
                        imports.add(name.name)
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        imports.add(node.module)
        except SyntaxError:
            # If ast parsing fails, use regex as a fallback
            import_patterns = [
                r'^\s*import\s+([a-zA-Z0-9_.,\s]+)',
                r'^\s*from\s+([a-zA-Z0-9_.]+)\s+import',
            ]
            
            for pattern in import_patterns:
                matches = re.findall(pattern, content, re.MULTILINE)
                for match in matches:
                    for module in match.split(','):
                        imports.add(module.strip())
    except Exception as e:
        print(f"Error analyzing imports in {file_path}: {e}")
    
    return imports

def get_js_dependencies(file_path: str) -> Set[str]:
    """Extract JS dependencies from a JavaScript file."""
    dependencies = set()
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Look for require or import statements
        require_pattern = r'require\([\'"]([^\'"]+)[\'"]\)'
        import_pattern = r'from\s+[\'"]([^\'"]+)[\'"]\s*'
        script_import_pattern = r'import\s+[^\'";]*?[\'"]([^\'"]+)[\'"]\s*'
        
        for pattern in [require_pattern, import_pattern, script_import_pattern]:
            matches = re.findall(pattern, content)
            dependencies.update(matches)
            
        # Look for references to other JS files
        js_ref_pattern = r'src=[\'"](.*?\.js)[\'"]\s*'
        matches = re.findall(js_ref_pattern, content)
        dependencies.update(matches)
        
    except Exception as e:
        print(f"Error analyzing dependencies in {file_path}: {e}")
    
    return dependencies

def get_html_includes(file_path: str) -> Tuple[Set[str], Set[str]]:
    """Extract script and style includes from HTML file."""
    scripts = set()
    styles = set()
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Find script includes
        script_pattern = r'<script[^>]*src=[\'"]([^\'"]+)[\'"](.*?)>'
        for match in re.findall(script_pattern, content):
            scripts.add(match[0])
            
        # Find style includes
        style_pattern = r'<link[^>]*href=[\'"]([^\'"]+\.css)[\'"](.*?)>'
        for match in re.findall(style_pattern, content):
            styles.add(match[0])
            
    except Exception as e:
        print(f"Error analyzing includes in {file_path}: {e}")
    
    return scripts, styles

def resolve_path(base_path: str, relative_path: str) -> str:
    """Resolve a relative path to an absolute path."""
    if relative_path.startswith(('http:', 'https:', '//')):
        return relative_path  # External URL
        
    if relative_path.startswith('/'):
        # Path from root directory
        return os.path.join(ROOT_DIR, relative_path.lstrip('/'))
    else:
        # Relative path
        return os.path.join(os.path.dirname(base_path), relative_path)

def find_backend_dependencies() -> Dict[str, Set[str]]:
    """Find dependencies for backend Python files."""
    dependencies = {}
    python_files = []
    
    # Find all Python files
    for root, _, files in os.walk(ROOT_DIR):
        for file in files:
            if file.endswith('.py'):
                python_files.append(os.path.join(root, file))
    
    # Analyze imports for each Python file
    for file_path in python_files:
        rel_path = os.path.relpath(file_path, ROOT_DIR)
        imports = get_python_imports(file_path)
        dependencies[rel_path] = imports
    
    return dependencies

def find_frontend_dependencies() -> Dict[str, Set[str]]:
    """Find dependencies for frontend files (HTML, JS, CSS)."""
    dependencies = {}
    
    # Find all HTML and JS files
    html_files = []
    js_files = []
    
    for root, _, files in os.walk(ROOT_DIR):
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
            elif file.endswith('.js'):
                js_files.append(os.path.join(root, file))
    
    # Analyze HTML files
    for file_path in html_files:
        rel_path = os.path.relpath(file_path, ROOT_DIR)
        scripts, styles = get_html_includes(file_path)
        
        # Resolve paths
        resolved_scripts = {resolve_path(file_path, script) for script in scripts}
        resolved_styles = {resolve_path(file_path, style) for style in styles}
        
        dependencies[rel_path] = {
            'scripts': resolved_scripts,
            'styles': resolved_styles
        }
    
    # Analyze JS files
    for file_path in js_files:
        rel_path = os.path.relpath(file_path, ROOT_DIR)
        deps = get_js_dependencies(file_path)
        
        # Resolve paths
        resolved_deps = {resolve_path(file_path, dep) for dep in deps}
        
        if rel_path in dependencies:
            dependencies[rel_path]['js_imports'] = resolved_deps
        else:
            dependencies[rel_path] = {'js_imports': resolved_deps}
    
    return dependencies

def check_server_startup() -> bool:
    """Check if the server can start successfully."""
    try:
        # Try to start the server with a timeout
        process = subprocess.Popen(
            ["python", "server.py"],
            cwd=ROOT_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait for a short time to see if the server starts
        try:
            stdout, stderr = process.communicate(timeout=3)
            if process.returncode != 0:
                print(f"Server startup failed with error: {stderr.decode()}")
                return False
        except subprocess.TimeoutExpired:
            # If we get here, the server is still running, which is good
            process.terminate()
            return True
            
        # If we reach here, the server exited quickly, which might indicate an error
        return "Rahalah server started" in stdout.decode()
        
    except Exception as e:
        print(f"Error checking server startup: {e}")
        return False
    finally:
        # Make sure the server is terminated
        try:
            process.terminate()
        except:
            pass

def identify_root_files() -> Dict[str, str]:
    """Identify all files in the root directory and classify them."""
    root_files = {}
    
    for item in os.listdir(ROOT_DIR):
        item_path = os.path.join(ROOT_DIR, item)
        
        # Skip directories and hidden files
        if os.path.isdir(item_path) or item.startswith('.'):
            continue
            
        # Skip files in the critical list
        if item in CRITICAL_FILES:
            status = "CRITICAL"
        elif item.endswith(('.py', '.js', '.json', '.md', '.txt')):
            status = "ANALYZE"
        else:
            status = "UNKNOWN"
            
        root_files[item] = status
    
    return root_files

def test_file_removal(file_path: str) -> bool:
    """Test if a file can be safely removed."""
    # Backup the file
    backup_path = os.path.join(BACKUP_DIR, os.path.basename(file_path))
    
    try:
        # Create backup
        with open(file_path, 'rb') as src, open(backup_path, 'wb') as dst:
            dst.write(src.read())
            
        # Remove the file
        os.remove(file_path)
        
        # Check if the server can start
        server_ok = check_server_startup()
        
        # Restore the file
        with open(backup_path, 'rb') as src, open(file_path, 'wb') as dst:
            dst.write(src.read())
            
        return server_ok
    except Exception as e:
        print(f"Error testing removal of {file_path}: {e}")
        
        # Try to restore the file if possible
        try:
            if os.path.exists(backup_path) and not os.path.exists(file_path):
                with open(backup_path, 'rb') as src, open(file_path, 'wb') as dst:
                    dst.write(src.read())
        except:
            pass
            
        return False

def analyze_dependencies():
    """Analyze all dependencies and provide a report on which files can be removed."""
    print("Analyzing Rahalah dependencies...")
    
    # Get backend dependencies
    print("Analyzing backend dependencies...")
    backend_deps = find_backend_dependencies()
    
    # Get frontend dependencies
    print("Analyzing frontend dependencies...")
    frontend_deps = find_frontend_dependencies()
    
    # Identify root files
    print("Identifying root files...")
    root_files = identify_root_files()
    
    # Analyze ANALYZE-status files
    removable_files = []
    required_files = list(CRITICAL_FILES)
    
    for file, status in root_files.items():
        if status != "ANALYZE":
            continue
            
        file_path = os.path.join(ROOT_DIR, file)
        print(f"Testing if {file} can be safely removed...")
        
        # Check if the file is directly imported or included
        is_imported = False
        
        # Check Python imports
        for _, imports in backend_deps.items():
            module_name = file[:-3] if file.endswith('.py') else file
            if module_name in imports or f".{module_name}" in imports:
                is_imported = True
                break
                
        # Check frontend includes
        if not is_imported:
            for _, deps in frontend_deps.items():
                if 'scripts' in deps and any(file in script for script in deps['scripts']):
                    is_imported = True
                    break
                    
                if 'styles' in deps and any(file in style for style in deps['styles']):
                    is_imported = True
                    break
                    
                if 'js_imports' in deps and any(file in imp for imp in deps['js_imports']):
                    is_imported = True
                    break
        
        if is_imported:
            print(f"  {file} is imported or included by other files.")
            required_files.append(file)
            continue
        
        # If not directly imported, check if removal breaks the server
        if test_file_removal(file_path):
            print(f"  {file} can be safely removed.")
            removable_files.append(file)
        else:
            print(f"  {file} is required for the system to function.")
            required_files.append(file)
    
    # Generate report
    report = {
        "required_files": sorted(required_files),
        "removable_files": sorted(removable_files),
        "critical_directories": sorted(CRITICAL_DIRS)
    }
    
    # Save report to file
    report_path = os.path.join(ROOT_DIR, "dependency_analysis_report.json")
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\nDependency analysis complete! Report saved to {report_path}")
    print("\nRequired files:")
    for file in sorted(required_files):
        print(f"  {file}")
    
    print("\nFiles that can be safely removed:")
    for file in sorted(removable_files):
        print(f"  {file}")
    
    return report

if __name__ == "__main__":
    analyze_dependencies()
