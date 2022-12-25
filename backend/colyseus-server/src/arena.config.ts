import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import basicAuth from "express-basic-auth";


import * as dotenv from "dotenv";
dotenv.config();

/**
 * Import your Room files
 */
import { myFirstJourney001 } from "./rooms/myFirstJourney001";
import { Lobby } from "./rooms/Lobby";
import { RoomRegistry } from "./roomRegistry";
import { myFirstJourney002 } from "./rooms/myFirstJourney002";

export default Arena({
    getId: () => "Almost Evades",

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('Lobby', Lobby);

        gameServer.define(new myFirstJourney001().getRegistryData().id, myFirstJourney001);
        RoomRegistry.register(new myFirstJourney001().getRegistryData().id, new myFirstJourney001().getRegistryData());

        gameServer.define(new myFirstJourney002().getRegistryData().id, myFirstJourney002);
        RoomRegistry.register(new myFirstJourney002().getRegistryData().id, new myFirstJourney002().getRegistryData());

    },

    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         */
        app.get("/", (req, res) => {
            res.redirect("https://evades.almostapps.eu/");
        });

        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        const users: any = {};
        users[process.env.ADMIN_USER];
        users[process.env.ADMIN_PASSWORD];
        const basicAuthMiddleware = basicAuth({
            // list of users and passwords
            users,
            // sends WWW-Authenticate header, which will prompt the user to fill
            // credentials in
            challenge: true
        });
        
        app.use("/colyseus", basicAuthMiddleware, monitor());
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});