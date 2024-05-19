import express from "express";
import Eta from "eta";
import fs from "fs";
import path from "path";
import { PresetOutput } from "@utils/output";
import { HTTPInterface } from "@utils/serverinterface";
import DefaultRoute, { DefaultAPIRoute } from "@web/route";
import DatabaseInterface from "@db/database";
import GetRoutesResursively from "@utils/recursive";

export class Server
{
    private readonly output: PresetOutput = new PresetOutput("http");
    private routes: DefaultRoute[] = [];
    private apiRoutes: DefaultAPIRoute[] = [];
    private app: HTTPInterface;
    private databaseInterface: DatabaseInterface | null;
    private webpackManifest: object = {};

    public constructor()
    {
        this.app = express();
        this.app.variables = {};
        this.databaseInterface = null;
        this.app.engine("eta", Eta.renderFile);
        this.app.set("view engine", "eta");
        this.app.set("views", "./views");
        this.app.use(express.static("./public"));
        this.app.use("/webpack", express.static("./bundle"));
        this.loadWebpackManifest();
    }

    public async start() : Promise<void>
    {
        this.output.Log("Starting server...");
        await this.addRoutes();
        this.addErrorMiddleware();
        this.app.listen(process.env.HTTP_PORT as string, () => this.output.Log("Server started!"));
    }

    public async setDatabaseInterface(db: DatabaseInterface)
    {
        this.databaseInterface = db;
    }

    public async setPublicVariable(name: string, value: any)
    {
        this.app.variables[name] = value;
    }

    public async addRoutes()
    {
        this.output.Log("Adding routes...");
        fs.readdirSync("./dist/web/routes").forEach((file) =>
        {
            let route = require(`./routes/${file}`).default;
            this.output.Log(`Adding route ${route.name.cyan}...`);
            let routeIndex = this.routes.push(new route(this.databaseInterface));
            this.app[this.routes[routeIndex - 1].Method.toLowerCase()](this.routes[routeIndex - 1].Path, (request:any, response:any) =>
            {
                this.routes[routeIndex - 1].Serve(request, response);
            });

        });

        this.output.Log("Adding API routes...");

        const apiRoutes = GetRoutesResursively("./dist/web/api");
        for (let route of apiRoutes)
        {
            route = route.replace(/^(\.\/dist\/web\/api\/)/g, '').replace(/\.js$/g, '');
            this.output.Log(`Adding API route :: ${route.cyan}...`);
            let _route = require(`./api/${route}.js`).default;
            let routeIndex = this.apiRoutes.push(new _route(this.databaseInterface));

            this.app[this.apiRoutes[routeIndex - 1].Method.toLowerCase()](`/api/${route}`, (request: any, response: any) =>
            {
                this.apiRoutes[routeIndex - 1].Serve(request, response);
            });
        }
        
    }

    private loadWebpackManifest()
    {
        const manifestRoute = fs.readFile(path.join(__dirname, "..", "..", "bundle", "manifest.json"), 'utf8', (err, data) =>
        {
            if (err)
            {
                this.output.Error(err);
                return;
            }

            this.webpackManifest = JSON.parse(data);
        });

        this.app.use((req, res, next) => {
            res.locals.manifest = this.webpackManifest;
            next();
        });
    }

    public addErrorMiddleware()
    {
        this.app.use(function (req, res) {
            res.status(404).render('error');
        });
    }
}