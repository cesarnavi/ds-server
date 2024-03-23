import _express from "express";
import router from "./router";
import cors from "cors"
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import dotenv from "dotenv";
import { connectToDatabase, nextSequence } from "./lib/database";
import logger from "./lib/logger";
import { Category, ROLES, Topic, User } from "./models";
import { DEFAULT_CATEGORIES, DEFAULT_TOPICS } from "./data";

dotenv.config();

class Server {

    express: _express.Application;s
    port = process.env.PORT || 4000


    async loadDatabase(){ // Connects to database service
        try{
            await connectToDatabase();
            if(process.env.NODE_ENV !== "PRODUCTION"){
                await new User({
                    email: "root@test.com",
                    role: ROLES.ADMIN,
                    username: "root"
                })
                .save()
                .then(()=>logger.debug("Admin default user created successfully"))
                .catch((e)=>{
                    logger.debug("Default admin user already exists")
                });
                for await(let c of DEFAULT_CATEGORIES){
                    await new Category({...c, include_external_url: c.include_external_url === true}).save().catch((e)=>{});
                }
                for await(let c of DEFAULT_TOPICS){
                    await new Topic(c).save().catch((e)=>{});
                }
            }
           


            logger.info("Connected to MongoDB");
        }catch(e){
            logger.error("Error connecting to database: ",e.message);
            process.exit(0);
        }
    }

    loadServer(){ //Initialize express server
        if(this.express){
            logger.warn(" [Server] Already initialized")
            return;
        }

        this.express = _express();

        // Add middlewares to the app
        this.express.use(_express.json({ limit: "16000kb" }));
        this.express.use(cors({
            origin :"*"
        }));


        if(process.env.NODE_ENV != "PRODUCTION"){
            this.express.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerJsDoc({
                definition:{
                    openapi :"3.0.0",
                    info:{
                        version: "1.0.0",
                        title: "Wispok API Documentation",
                        description: "A basic example of CRUD for users"
                    },
                
                    servers: [
                        {
                           url:"http://localhost:"+this.port + "/v1"
                        }
                    ]
                },
                apis: [
                    "./src/routes/auth.routes.ts",
                    "./src/routes/categories.routes.ts",
                    "./src/routes/items.routes.ts",
                    "./src/routes/topics.routes.ts",
                    "./src/routes/users.routes.ts"
                   
                ]
            })));
        }
        //Add routes to our app
        this.express.use(`/v1`, router);

        // Start the server on the specified port
		this.express.listen(Number(this.port), () => {
			logger.info(`Server :: Running @ 'http://localhost:${this.port}'`);
            if(process.env.NODE_ENV != "PRODUCTION")
                logger.debug(`API documentation ready @ 'http://localhost:${this.port}/docs`);
		}).on('error', (_error) => {
			return logger.error('Error starting express: ', _error.message);
            
		});
    }

}

export default new Server