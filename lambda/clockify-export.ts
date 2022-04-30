import axios from 'axios';
import { ClockifyUser } from './interfaces/Clockify';
import { LambdaSecretsManager } from './LambdaSecretsManager';

const AWS_REGION = 'eu-central-1';
const BASE_ENDPOINT = 'https://api.clockify.me/api/v1';
const WORKSPACE_ID = '5f4caa4cd23b5f1fed605f58';

exports.handler = async () => {

    // Get API key
    const sm = new LambdaSecretsManager(AWS_REGION);
    const clockifyApiKey = sm.getSecretValue('clockifyApiKey');

    // Throw error if API key not accessible
    if(!clockifyApiKey || clockifyApiKey === '') throw 'ClockifyApiKeyException';

    // Get all employees
    let userList = new Map<string, ClockifyUser>();
    axios.get(`${BASE_ENDPOINT}/workspaces/${WORKSPACE_ID}/users`, {
      headers: {
        'X-Api-Key': clockifyApiKey
      }
    }).then(res => {
      if(res.status === 200 || res.status === 201) {
        res.data.forEach((user: ClockifyUser) => {
          userList.set(user.id, { id: user.id, email: user.email });
        })
      } else {
        throw `${res.status} - ${res.statusText}`
      }
    }).catch(err => {
      throw err;
    });

    // get all time entries per employee for current month
    userList.forEach(user => {
      axios.get(`${BASE_ENDPOINT}/workspaces/${WORKSPACE_ID}/user/${user.id}/time-entries`, {
        headers: {
          'X-Api-Key': clockifyApiKey
        },
        params: {
          // TODO: define start and end date
          start: '',
          end: '',
        }
      }).then(res => {
        if(res.status === 200 || res.status === 201) {
          userList.set(user.id, { id: user.id, email: user.email, timeEntries: res.data });
        } else {
          throw `${res.status} - ${res.statusText}`
        }
      }).catch(err => {
        throw err;
      });
    });

    return userList;
  };