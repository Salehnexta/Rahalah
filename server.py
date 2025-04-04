import http.server
import socketserver

PORT = 8084

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=".", **kwargs)

handler = MyHttpRequestHandler

with socketserver.TCPServer(("", PORT), handler) as httpd:
    print(f"Rahalah server started at http://localhost:{PORT}")
    httpd.serve_forever()
