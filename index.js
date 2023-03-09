const express = require("express");
const app = express();

const config = require("config");
const axios = require("axios");

const validate_auth = require("./utils/validation/auth");
const { compare } = require("./utils/bcrypt");
const { generate_admin_token, generate_token } = require("./utils/auth");

if(!config.get("JWT_PRIVATE_KEY")) {
    console.log("FATAL ERROR: JWT_PRIVATE_KEY not defined!");
    process.exit(1);
}

app.use(express.json())

app.post("/auth/login", async (req, res) => {
    try {
        console.log(req.body);
        await validate_auth(req.body);
        const { data } = await axios(`http://localhost:5000/users/?email=${req.body.email}`);
        console.log(data);
        //if(!user) return res.status(404).send(ClientError[404]({ message: "User not found." }));
        if(!data) return res.status(404).send("User not found.");
        const valid_password = await compare(req.body.password, data.password);
        //if(!valid_password) return res.status(404).send(ClientError[404]({ message: "User not found." }));
        if(!valid_password) return res.status(404).send("User not found.");
        let token = null;
        if(data.admin){ 
            console.log(true);
            token = generate_admin_token(data.id, data.admin);
        }else{
            token = generate_token(data._id);
        }
        res.status(204).header("X-auth-token", token).send();
    } catch (err) {
        console.log(err);
        if(err.response) return res.status(err.response.status).send(err.response.data);
        res.status(400).send(err.message);
    }
});

app.post("/auth/signup", async (req, res) => {
    try{
        const response = await axios({
            method: "post",
            headers: req.headers,
            data: req.body,
            url: "http://localhost:5000/users"
        })            
        res.status(response.status).send(response.data);
    }catch(err){
        if(err.response) return res.status(err.response.status).send(err.response.data);
        res.status(400).send(err.message);
    }
});


app.listen(4000, () => console.log("auth-service listening on port 4000"));