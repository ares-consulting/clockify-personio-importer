import { SecretsManager } from "aws-sdk";

export class LambdaSecretsManager {

    private client: SecretsManager;
    private key: string | undefined;

    constructor(region: string) {
        this.client = new SecretsManager({
            region: region
        });
    }

    public getSecretValue(secretId: string): string | undefined {
      this.client.getSecretValue({SecretId: secretId}, (err, data) => {
        if (err) {
          throw err.code;
        } else {
          // Decrypts secret using the associated KMS CMK.
          // Depending on whether the secret is a string or binary
          if ('SecretString' in data) {
            this.key = data.SecretString;
          } else {
            throw 'SecretIsBinaryNotStringException';
          }
        }
      });
      return this.key;
    }

}