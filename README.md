# FuzzyLinks

A fast URL management web application that uses fuzzy search to help you find bookmarks instantly without navigating folder hierarchies.

## Why FuzzyLinks?

Traditional bookmark managers force you to organize links into folders and remember where you put them. FuzzyLinks lets you search for any link by typing partial matches of the title, URL, or tags—no folders required.

Built for users who save hundreds of links and need sub-second retrieval without the overhead of maintaining complex folder structures.

## Features

- **Fuzzy Search**: Find any link by typing partial matches using Fuse.js fuzzy search algorithm
- **Fast Performance**: Sub-second search results across large URL collections with Redis caching
- **URL Grouping**: Organize links into collections without rigid folder hierarchies
- **Full CRUD Operations**: Create, read, update, and delete URLs with a clean interface
- **Responsive Design**: Fast page loads and instant search with Tailwind CSS

## Tech Stack

- **Backend**: Python, Django, PostgreSQL, Redis
- **Frontend**: JavaScript, Tailwind CSS
- **Deployment**: DigitalOcean VPS with Nginx/Gunicorn reverse proxy

## Usage

The site is live at: `fuzzylinks.site`

## Usage

1. Add URLs with titles, descriptions, and optional tags
2. Use the search bar to find links by typing any part of the title, URL, or tags
3. Group related URLs together for better organization

## Work In Progress

This application is still being worked on. It is open source so feel free to modify it as you see fit.

## Production Deployment

The application is deployed using:

- Gunicorn WSGI server
- Nginx reverse proxy
- PostgreSQL database
- Redis for caching

## License

MIT License
