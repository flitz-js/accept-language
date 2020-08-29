import request from "supertest";

it("should return 'A test' as string, if 'en' is only supported, submitted language", async () => {
  const app = await global.createTestApp();

  app.get('/', async (req, res) => {
    res.write(req.t!('test'));
    res.end();
  });

  const response = await request(app)
    .get('/')
    .set('Accept-Language', 'da, en-GB;q=0.9, en;q=0.8')
    .parse(global.parseBody)
    .send()
    .expect(200);

  const str = response.body.toString('utf8');

  expect(str).toBe('A test');
});

it("should return 'Ein Täst' as string, if 'de' is first an has the highest weight", async () => {
  const app = await global.createTestApp();

  app.get('/', async (req, res) => {
    res.write(req.t!('test'));
    res.end();
  });

  const response = await request(app)
    .get('/')
    .set('Accept-Language', 'de, en-GB;q=0.7, en;q=0.8')
    .parse(global.parseBody)
    .send()
    .expect(200);

  const str = response.body.toString('utf8');

  expect(str).toBe('Ein Täst');
});

it("should return 'Ein Täst' as string, if 'de' is 2nd an has the highest weight", async () => {
  const app = await global.createTestApp();

  app.get('/', async (req, res) => {
    res.write(req.t!('test'));
    res.end();
  });

  const response = await request(app)
    .get('/')
    .set('Accept-Language', 'en-GB;q=0.7, de, en;q=0.8')
    .parse(global.parseBody)
    .send()
    .expect(200);

  const str = response.body.toString('utf8');

  expect(str).toBe('Ein Täst');
});

it("should return 'A test' as string, if 3rd language 'en' has the heigest weight", async () => {
  const app = await global.createTestApp();

  app.get('/', async (req, res) => {
    res.write(req.t!('test'));
    res.end();
  });

  const response = await request(app)
    .get('/')
    .set('Accept-Language', 'de, en-GB;q=0.7, en;q=1.8')
    .parse(global.parseBody)
    .send()
    .expect(200);

  const str = response.body.toString('utf8');

  expect(str).toBe('A test');
});

it("should return 'Ein Täst' as string, id no submitted language is supported", async () => {
  const app = await global.createTestApp();

  app.get('/', async (req, res) => {
    res.write(req.t!('test'));
    res.end();
  });

  const response = await request(app)
    .get('/')
    .set('Accept-Language', 'da, en-GB;q=0.7, en-us;q=1.8')
    .parse(global.parseBody)
    .send()
    .expect(200);

  const str = response.body.toString('utf8');

  expect(str).toBe('Ein Täst');
});
