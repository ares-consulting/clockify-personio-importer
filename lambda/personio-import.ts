import axios from "axios";
import { ClockifyUser } from "./interfaces/Clockify";
import { LambdaSecretsManager } from "./LambdaSecretsManager";

const AWS_REGION = 'eu-central-1';
const BASE_ENDPOINT = 'https://api.personio.de/v1';
//TODO: Register app at personio for app id
const APP_ID = '';

exports.handler = async (state: any) => {

  // Get API key
  const sm = new LambdaSecretsManager(AWS_REGION);
  const personioApiKey = sm.getSecretValue('personioApiKey');

  // Throw error if API key not accessible
  if (!personioApiKey || personioApiKey === '') throw 'PersonioApiKeyException';

  const personioUsers = new Map<string, any>();

  // Get employee id by email
  state.forEach((user: ClockifyUser) => {
    axios.get(`${BASE_ENDPOINT}/company/employees`, {
      headers: {
        'X-Personio-App-ID': APP_ID,
        'Accept': 'application/json'
      },
      params: {
        email: user.email
      }
    }).then(res => {
      if (res.status === 200 || res.status === 201) {
        // Map clockify user to personio employee ID
        personioUsers.set(res.data.data.attributes.id.value, user);
      } else {
        throw `${res.status} - ${res.statusText}`
      }
    }).catch(err => {
      throw err;
    });
  });

  axios.post(`${BASE_ENDPOINT}/company/attendances`, {
    headers: {
      'X-Personio-App-ID': APP_ID,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    data: personioUsers
  }).then(res => {
    if (res.status === 200 || res.status === 201) {
      //TODO: Success message for logs
    } else {
      throw `${res.status} - ${res.statusText}`
    }
  }).catch(err => {
    throw err;
  });

};