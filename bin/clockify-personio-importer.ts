#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ClockifyPersonioImporterStack } from '../lib/clockify-personio-importer-stack';

const app = new cdk.App();
new ClockifyPersonioImporterStack(app, 'ClockifyPersonioImporterStack');
