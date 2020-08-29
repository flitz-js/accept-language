import request from "supertest";

it("should use 'en' as language and 'da, en, en-gb' as language list", async () => {
  const app = await global.createTestApp();

  app.get('/', async (req, res) => {
    res.write(JSON.stringify({
      lang: req.lang,
      languages: req.languages
    }))
    res.end();
  });

  const response = await request(app)
    .get('/')
    .set('Accept-Language', 'da, en-GB;q=0.7, en;q=0.8')
    .parse(global.parseBody)
    .send()
    .expect(200);

  const obj = JSON.parse(response.body.toString('utf8'));

  expect(typeof obj).toBe('object');
  expect(obj.lang).toBe('en');
  expect(Array.isArray(obj.languages)).toBe(true);
  expect(obj.languages.length).toBe(3);
  expect(obj.languages[0]).toBe('da');
  expect(obj.languages[1]).toBe('en');
  expect(obj.languages[2]).toBe('en-gb');
});

it("should use 'en' as language and 'en, de, en-gb' as language list", async () => {
  const app = await global.createTestApp();

  app.get('/', async (req, res) => {
    res.write(JSON.stringify({
      lang: req.lang,
      languages: req.languages
    }))
    res.end();
  });

  const response = await request(app)
    .get('/')
    .set('Accept-Language', 'en, en-GB;q=0.7, de;q=0.8')
    .parse(global.parseBody)
    .send()
    .expect(200);

  const obj = JSON.parse(response.body.toString('utf8'));

  expect(typeof obj).toBe('object');
  expect(obj.lang).toBe('en');
  expect(Array.isArray(obj.languages)).toBe(true);
  expect(obj.languages.length).toBe(3);
  expect(obj.languages[0]).toBe('en');
  expect(obj.languages[1]).toBe('de');
  expect(obj.languages[2]).toBe('en-gb');
});

it("should use 'de' as language and 'de, en-gb, en' as language list", async () => {
  const app = await global.createTestApp();

  app.get('/', async (req, res) => {
    res.write(JSON.stringify({
      lang: req.lang,
      languages: req.languages
    }))
    res.end();
  });

  const response = await request(app)
    .get('/')
    .set('Accept-Language', 'de, en-GB;q=0.9, en;q=0.8')
    .parse(global.parseBody)
    .send()
    .expect(200);

  const obj = JSON.parse(response.body.toString('utf8'));

  expect(typeof obj).toBe('object');
  expect(obj.lang).toBe('de');
  expect(Array.isArray(obj.languages)).toBe(true);
  expect(obj.languages.length).toBe(3);
  expect(obj.languages[0]).toBe('de');
  expect(obj.languages[1]).toBe('en-gb');
  expect(obj.languages[2]).toBe('en');
});
