import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import basicAuth from "express-basic-auth";

/**
 * Import your Room files
 */
import { myFirstJourney001 } from "./rooms/myFirstJourney001";

export default Arena({
    getId: () => "Almost Evades",

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('myFirstJourney001', myFirstJourney001);

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
        const basicAuthMiddleware = basicAuth({
            // list of users and passwords
            users: {
                "almostAdmin": "almostAdmin", // TODO: Set from ENV var
            },
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