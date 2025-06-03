import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: "vabot-1f180",
    private_key_id: "e0beca09010bf79d540c31a03ccbe1ceff9ea644",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC3LJ+aV290b2Jl\n6r+W16PBU94rIZ+3KUecTSUEOkc0H6lei7eSb99s3EIiKsi6CasFNDkC+o108Wkz\nb7S0z9sJIK2+qFz6ckEhUMjEIbsgf454AQr3DdQ5fA6w6xA+B8HAiTeqjEfy3CCu\nvFGLPXV4nVPRu9PlMS5r5PZxFVRczfU8j1pkFp42V8AtR6on4qogefn+6mXLI7GL\nCtXB71roVL86zW4cChAd9t/taa+vWeqmKf0Udp+0Uz1SiaXBZEUQ84EnMfoCoieT\nieLYJM1/5okcx4SuZ+S1fo1xgMNrN9bViGf+YFC4a6Jbau6z7ukYn94w5ncxDWgI\nQSvay5VdAgMBAAECggEAAOwoxrl9q7SdAtxG9mbLEA4ikunP7/BgHY/KHxoNJWqq\nvMDFDEt48MB3cei3lb4MKrknVCDKIF2XGlIoT29AU8INUYJTcnAdbGlc6JeEAgVk\nNnUPxq++3Xt4hJTNJdyasc60cAJHoV774Scua4HSV3b/X8qH+36Q28jNlEM3g9Pn\nwCkLSxK1RyUsoP+wjz/vir/eN4zdr7dCc0MV36QqksYbneJitSq1kn4LTspmiztH\niRqyGTsebbhjw/mesYlgaHmkjB+iU9lxU65QCvcsNaaqEJBChdOMmHOXJ8McjVJu\nD7pfq52G50HrVk4wh05dengV0z9H2Ax5dE9aah7P1wKBgQDZ7fVAzvZxLj3FmXgv\ncm6G/MSGYSx4WVZtMC1llv9uIiWqoHj8hz64Chwv04XvI7gpGaKdTyJbAvEUCDfb\ncXGRk0YWcQ20vt8sqVm3iC3qhQBF33mjKaCglPzVvlu0WdJuZQluRBFjP57pq/xP\nTMLkCNxD/n8FCvHqfgmRsxoSWwKBgQDXLGAByrqkKTtgcCSfryqHLlXyPGwsgizM\ngPjpKXv5fTh5DXcweV33s0jaSRWbV5YhQbeFZw0WqvmBeNET6yX6fVYZJneEGnGe\nN7qTB9YWnBy742GitlHRuK/e5ae5SJDY6YBCxkN+gkmyQ0wxZYfiHVTN3Oq295/c\nl5hhpBeUpwKBgEyYQAzJMQDSmc9rgzxZ4dL74C7C1Jhv/dpehnYgPiJ9SfPQdvV6\nq2aP1xxQIdDNIxr+8ZKMj6yhOg4qXUd5dcsOkiGtFn4iX9oYo3nIGStGF7R3OQ9J\nwDTwaHTPdPfMYhN+23Ov5NSXNck3M3TDq/Pt0Uzsk8Q39pLOPZrB8jXlAoGAHht1\na4rERsgGKN5IIZfO6Y9QM07FDA1C23KIYYeOc0BUMIvzy3KP9WK+pNxpC41b0ldx\nqFbc+/j8ZGNVTeYvMDdtXqOFQZS5pRvDHWORTySU2K1eMfg0xpWC9jtIFqLSsacq\nbS10sDTmvuyvspG0S60y+oMYzHUlhyYnCjJ9oi0CgYEAxPUEwIj3/NxT3TxXxuwH\ng5qTDSWDODyrj7Kt2co9LtRzpold2E5PW6TX0iaBmzp2AIGNJ6az3xq+/ObLfA46\nKQ3b+3M7w29GbpEw2HliGcOGQGFxZB+mt9VhdFBZQ4sIpZhYS1uWtKvCg+4nmaoC\n93X0VHP8andd8athjhznHGk=\n-----END PRIVATE KEY-----\n",
    client_email: "firebase-adminsdk-fbsvc@vabot-1f180.iam.gserviceaccount.com",
    client_id: "111311919971485815689",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40vabot-1f180.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
  }),
});

export default admin;
