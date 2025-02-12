import express from "express";
import { Request, Response, Router } from "express";
import { AccountsHandler } from "./accounts/accounts";
import { FinancialManager } from "./Financial/financial";
import { EventsHandler } from "./Events/events"; 
import cors from 'cors';





const port = 3000;
const app = express();
const routes = Router();

// Middleware para habilitar o parsing de JSON
app.use(express.json());


app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE'],  
    allowedHeaders: ['Content-Type', 'Authorization'],  
    credentials: true
}));

// Definir as rotas
routes.get('/', (req: Request, res: Response) => {
    res.statusCode = 200;
    res.send('Acesso permitido. Rota default disponível.');
});


app.post('/register', AccountsHandler.registerHandler);
app.post('/login', AccountsHandler.loginHandler);
app.post('/addFunds', FinancialManager.addFunds);
app.post('/withdrawFunds', FinancialManager.withdrawFunds);
app.post("/addNewEvent", EventsHandler.addNewEvent);
app.post("/evaluateEvent", EventsHandler.moderateEvent);
app.delete("/deleteEvent", EventsHandler.deleteEvent);
app.get('/searchEvents', EventsHandler.searchEvents);
app.post('/betOnEvent', EventsHandler.betOnEvent);
app.post('/finishEvent', EventsHandler.finishEvent)
app.get('/getEvents', EventsHandler.getEvents); 
app.get('/getProfile', AccountsHandler.getProfile)
app.get('/getBalance', FinancialManager.getBalance)


app.post("/test", (req, res) => {
    console.log(req.body); 
    res.send("Recebido!");
});


app.use(routes);

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Server is running on: http://localhost:${port}`);
});
