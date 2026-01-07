# Admin Panel Documentation

## Overview
The admin panel allows you to manage projects and update the resume link without modifying code directly.

## Access
Navigate to `/admin` in your browser. The default password is `admin123`.

**Important**: Change the password by setting the `ADMIN_PASSWORD` environment variable in your `.env.local` file:

```env
ADMIN_PASSWORD=your_secure_password_here
```

## Features

### 1. Resume Link Management
- View and update the resume link
- Changes are saved to `data/config.json`
- The site will use the updated link from the JSON file

### 2. Project Management
- **View Projects**: See all your projects in a list
- **Add Project**: Click "Add Project" to create a new project
- **Edit Project**: Click the edit icon on any project card
- **Delete Project**: Click the delete icon (with confirmation)

## Project Fields

When adding or editing a project, you'll need to provide:

- **Project ID**: Unique identifier (e.g., "myproject")
- **Category**: Project category (e.g., "Web Development")
- **Title**: Project title
- **Image Source**: Path to the project image (e.g., "/assets/projects-screenshots/project/1.png")
- **Screenshots**: Comma-separated list of screenshot filenames (e.g., "1.png, 2.png, 3.png")
- **GitHub URL**: Optional GitHub repository link
- **Live URL**: Link to the live project
- **Content Description**: Text description of the project

## Data Storage

- Projects are stored in `data/projects.json`
- Config (resume link) is stored in `data/config.json`
- These JSON files take precedence over the TypeScript files
- If JSON files don't exist, the site falls back to the TypeScript defaults

## Security Notes

1. **Change the default password** in production
2. The admin panel uses simple password authentication
3. For production, consider adding:
   - Rate limiting
   - More robust authentication (JWT, sessions)
   - HTTPS only
   - IP whitelisting

## Troubleshooting

### Projects not showing on main site
- The main site reads from TypeScript files by default
- To use JSON data, you may need to update the data loading logic
- Or manually sync JSON changes back to TypeScript files

### Can't login
- Check that `ADMIN_PASSWORD` is set correctly in `.env.local`
- Default password is `admin123` if no env variable is set
- Clear browser localStorage if having issues

### Changes not saving
- Check that the `data` directory exists and is writable
- Check server logs for errors
- Ensure you're logged in (check for auth token in localStorage)

