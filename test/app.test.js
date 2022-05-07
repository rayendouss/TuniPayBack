const request = require("supertest");

const app = require("../index.js");

describe("critere controller test", () => {
 
  it("get critere by id", async () => {
    const res = await request(app).get("/getmycritere/60eebb9333adea1234df75cf");
    expect(res.statusCode).toBe(200);      
  });
 

})

describe("Stat controller test", () => {
  
    it("get number user commanded", async () => {
      const res = await request(app).get("/getNbnuser");
      expect(res.statusCode).toBe(200);      
    });

    it("get product user commanded", async () => {
      const res = await request(app).get("/getbestproduct");
      expect(res.statusCode).toBe(200);
    });
})

describe('product controller test',()=>{
 
  it("get allproduct", async () => {
    const res = await request(app).get("/allposts/all");
    expect(res.statusCode).toBe(200);
  });

  it("get allproduct femme", async () => {
    const res = await request(app).get("/allposts/men");
    expect(res.statusCode).toBe(200);
  });
  
  it("get allproduct homme", async () => {
    const res = await request(app).get("/allposts/women");
    expect(res.statusCode).toBe(200);
  });
  
  it("get allproduct kids", async () => {
    const res = await request(app).get("/allposts/kids");
    expect(res.statusCode).toBe(200);
  });
  
  
  it("get product by id ", async () => {
    const res = await request(app).get("/post/6256c06808db9640ec91dc83");
    expect(res.statusCode).toBe(200);
  });

  it("get user posts ", async () => {
    const res = await request(app).get("/userpost/6255f0128c2b344b5c9ad4a4");
    expect(res.statusCode).toBe(200);
  });

  it("get brand posts ", async () => {
    const res = await request(app).get("/productname/CALVIN KLEIN");
    expect(res.statusCode).toBe(200);
  });

  
  it("get other brand posts ", async () => {
    const res = await request(app).get("/productname/TOMMY HILFIGER");
    expect(res.statusCode).toBe(200);
  });
})

describe('commande controller test',()=>{
  
  it("get all commande", async () => {
    const res = await request(app).get("/allCommandes");
    expect(res.statusCode).toBe(200);
  });
  
  it("get commande traité ", async () => {
    const res = await request(app).get("/commandetraite");
    expect(res.statusCode).toBe(200);
  });

  it("get user posts ", async () => {
    const res = await request(app).get("/userpost/6255f0128c2b344b5c9ad4a4");
    expect(res.statusCode).toBe(200);
  });

  it("get brand posts ", async () => {
    const res = await request(app).get("/productname/CALVIN KLEIN");
    expect(res.statusCode).toBe(200);
  });
})

describe('user controller test',()=>{

  it("get all user", async () => {
    const res = await request(app).get("/allUser");
    expect(res.statusCode).toBe(200);
  });
  it("get user detail", async () => {
    const res = await request(app).get("/userId/60eebb9333adea1234df75cf");
    expect(res.statusCode).toBe(200);
  });
  it("get brand detail", async () => {
    const res = await request(app).get("/userId/625623e52451a04b4c730b4a");
    expect(res.statusCode).toBe(200);
  });
  it("get vues profile", async () => {
    const res = await request(app).get("/listVue/60eebb9333adea1234df75cf");
    expect(res.statusCode).toBe(200);
  });
  it("hello", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toEqual("hello");
  });
})


afterAll(() => setTimeout(() => process.exit(4000)))



