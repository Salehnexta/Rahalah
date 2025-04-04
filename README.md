# Rahalah - AI Travel Planning SaaS

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A bilingual (English/Arabic) travel planning SaaS application that helps users search for flights and hotels through an AI-powered conversational interface. Rahalah (رحلة) means "journey" in Arabic, reflecting the application's purpose of assisting users with their travel plans.

## Features

### Flight Search
- Find flights between different cities worldwide
- View flight details including airline, departure/arrival times, and prices
- Get personalized flight recommendations based on preferences
- Direct links to airline booking websites
- Train service information between major cities

### Hotel Search
- Discover hotels based on location, price, and amenities
- View hotel details including ratings, prices, and features
- Provider information for all hotel listings
- Direct links to booking pages

### Car Rentals
- Compare car rental options from various providers
- View detailed information about available vehicles
- Filter by car type, price, and features
- Direct links to rental booking pages

### Bilingual Support
- Full English and Arabic language support
- Right-to-left (RTL) layout for Arabic
- Language toggle for easy switching

### User Interface
- ChatGPT-style conversational interface
- Example prompts for quick conversation starters
- Responsive design for all device sizes

## Project Structure

```
Rahalah/
├── css/
│   └── styles.css           # Styling for the web interface
├── images/                  # Directory for UI images
├── js/
│   └── script.js            # JavaScript for interactive functionality
├── index.html               # Main web interface
├── README.md                # This documentation file
├── requirements.txt         # Python dependencies
└── server.py                # Simple HTTP server for running the application
```

## Getting Started

1. Make sure you have Python installed on your system
2. Navigate to the project directory in your terminal
3. Run the server with: `python server.py`
4. Open your browser and go to: `http://localhost:8080`

## Usage

1. Select either "Flight Search" or "Hotel Search" to start a conversation
2. Type your query or click on one of the example prompts
3. View the assistant's response with relevant travel information
4. Get personalized travel recommendations and direct booking links

## Notes

- This is a SaaS application designed for online deployment
- In production, it connects to real flight and hotel APIs for live data
- The application can be extended with user accounts, saved trips, and payment processing

## Deployment

Rahalah can be deployed to any web hosting service that supports Python applications. Some recommended options include:

- Heroku
- AWS Elastic Beanstalk
- Google Cloud Platform
- Netlify (with serverless functions)

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- All contributors who help improve Rahalah
>>>>>>> master
