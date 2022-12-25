import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import basicAuth from "express-basic-auth";


import * as dotenv from "dotenv";
dotenv.config();

/**
 * Import your Room files
 */
import { Lobby } from "./rooms/Lobby";
import { RoomRegistry } from "./roomRegistry";
import { AA1 } from "./rooms/AA1";
import { AA2 } from "./rooms/AA2";
import { AA3 } from "./rooms/AA3";
import { AA4 } from "./rooms/AA4";
import { AA5 } from "./rooms/AA5";
import { AA6 } from "./rooms/AA6";
import { AA7 } from "./rooms/AA7";
import { AA8 } from "./rooms/AA8";
import { AA9 } from "./rooms/AA9";
import { AA10 } from "./rooms/AA10";
import { AA11 } from "./rooms/AA11";

export default Arena({
    getId: () => "Almost Evades",

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('Lobby', Lobby);

        // Angelic Alley
        RoomRegistry.register(gameServer, AA1);
        RoomRegistry.register(gameServer, AA2);
        RoomRegistry.register(gameServer, AA3);
        RoomRegistry.register(gameServer, AA4);
        RoomRegistry.register(gameServer, AA5);
        RoomRegistry.register(gameServer, AA6);
        RoomRegistry.register(gameServer, AA7);
        RoomRegistry.register(gameServer, AA8);
        RoomRegistry.register(gameServer, AA9);
        RoomRegistry.register(gameServer, AA10);
        RoomRegistry.register(gameServer, AA11);
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