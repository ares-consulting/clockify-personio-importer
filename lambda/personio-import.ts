import axios from "axios";
import { ClockifyUser } from "./interfaces/Clockify";
import { LambdaSecretsManager } from "./LambdaSecretsManager";

const AWS_REGION = 'eu-central-1';
const BASE_ENDPOINT = 'https://api.personio.de/v1';
const APP_ID = '';

exports.handler = async (state: any) => {

  // Get API key
  const sm = new LambdaSecretsManager(AWS_REGION);
  const personioApiKey = sm.getSecretValue('personioApiKey');

  // Throw error if API key not accessible
  if (!personioApiKey || personioApiKey === '') throw 'PersonioApiKeyException';

  axios.post(`${BASE_ENDPOINT}/company/attendances`, {
    headers: {
      'X-Personio-App-ID': APP_ID,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(res => {
    if (res.status === 200 || res.status === 201) {
      //TODO: Success
    } else {
      throw `${res.status} - ${res.statusText}`
    }
  }).catch(err => {
    throw err;
  });

};