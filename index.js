const express = require("express");
const mysql = require("mysql");

const app = express();
app.use(express.json());
const db = mysql.createConnection({
  host: "sql6.freesqldatabase.com	",
  user: "sql6686767",
  password: "RN2xVyvl5u",
  database: "sql6686767",
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.json(result);
    }
  });
});

app.post("/register", async (req, res) => {
  const salt = bcrypt.genSaltSync(10);
  const password = req.body.password;
  let value = await bcrypt.hash(password.toString(), salt);
  const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  db.query(sql, [req.body.username, req.body.email, value], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.json(result);
    }
  });
});

app.post("/login", async (req, res) => {
  con.query(
    "SELECT * FROM users WHERE email = ?",
    [req.body.email],
    (err, result) => {
      if (err) {
        console.log(err);
      } else if (result.length > 0) {
        bcrypt.compare(
          req.body.password.toString(),
          result[0].password,
          (err, result) => {
            if (err) {
              console.log(err);
            } else if (result) {
              res.json(result);
            }
          },
        );
      } else {
        res.json({ message: "Wrong username/password combination" });
      }
    },
  );
});
const port = 3000;

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
