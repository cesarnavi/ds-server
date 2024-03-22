## Getting Started

An api builded with Express + Typescript +  MongoDB + Mongoose + JWT Auth + upload files

Features:
- Mode cluster for better performance
- Swagger API docs
- Generated log for a better debug

#### Prerequisites:
- Node.js 18 or higher
- MongoDB Server installed
- Npm or yarn
#### Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`MONGOOSE_URI` mongodb://USER:PASSWORD@HOST:PORT/DB_NAME

`JWT_SECRET` 1242#$%$^%!@@$!%*(%^jnadkjcn

`NODE_ENV`  development | production 


Steps to launch locally 
1. Clone this repo
2. Add .env variables as needed
3. Run ‘npm install’ command
4. After dependencies installation, run ‘npm run build’ command to generate dist folter
5. Run ‘npm start’ command to start the server
6. Go to http://localhost:5000/docs to read API documentation


#### Notes
- Only admin users can create other admin users
    Defualt user created: username->root email->root@test.com
- Default categories and topics created when server starts