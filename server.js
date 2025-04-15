const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// SQL Server configuration
const config = {
    user: 'tsa',
    password: '12345678',
    server: 'DESKTOP-16NDUR5',
    database: 'infra',
    port: 1433,  
    options: {
        trustServerCertificate: true,
        trustedConnection: false,
        enableArithAbort: true,
        instancename: 'SQLEXPRESS'
    },
    connectionTimeout: 30000,       // Increased timeout to 30 seconds
    requestTimeout: 30000
};

// Connect to database
async function connectDB() {
    try {
        await sql.connect(config);
        console.log('Connected to SQL Server');
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

connectDB();

// Basic route test
app.get('/', (req, res) => {
    res.send('Server is running!');
});


app.get("/email", async (req, res) => {
    console.log("try to get email");
    try {
      const pool = await sql.connect(config);
      const result = await pool.request().query("SELECT * FROM email");
      res.json(result.recordset);
      result.then((res1) => {
        returnres.json(res1);
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  });


app.post("/post-email", async (req, res) => {
    const { email, name } = req.body;
    console.log("try to post email"); 
    try {
        const pool = await sql.connect(config);
        const result = await pool
            .request()
            .input("email", sql.VarChar, email)
            .input("name", sql.VarChar, name)
            .query("INSERT INTO email (email, name) VALUES (@email, @name)");
        
        res.status(200).json({ message: "Data inserted successfully" });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Failed to insert data" });
    }
});

//delete base on id
app.delete("/delete-email/:id", async (req, res) => {
    const { id } = req.params;
    console.log("try to delete email");  
    try {
        const pool = await sql.connect(config);
        const result = await pool
            .request()
            .input("id", sql.Int, id)
            .query("DELETE FROM email WHERE id = @id");
            
        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Email with thiss ID not found" });
        } else {
            res.status(200).json({ message: "Email deleted successfully" });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Failed to delete email" });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});