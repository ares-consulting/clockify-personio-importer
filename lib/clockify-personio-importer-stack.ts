import { Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as events from 'aws-cdk-lib/aws-events';
import { SfnStateMachine } from 'aws-cdk-lib/aws-events-targets';

export class ClockifyPersonioImporterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Exports data from clockify
    const clockifyExportFunction = new lambda.Function(this, 'ClockifyExportHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,    // execution environment
      code: lambda.Code.fromAsset('lambda'),  // code loaded from "lambda" directory
      handler: 'clockify-export.handler'      // file is "clockify-export", function is "handler"
    });

    // Maps data model
    const dataMapperFunction = new lambda.Function(this, 'DataMapperHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,    // execution environment
      code: lambda.Code.fromAsset('lambda'),  // code loaded from "lambda" directory
      handler: 'data-mapper.handler'          // file is "data-mapper", function is "handler"
    });

    // Imports data to personio
    const personioImportFunction = new lambda.Function(this, 'PersonioImportHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,    // execution environment
      code: lambda.Code.fromAsset('lambda'),  // code loaded from "lambda" directory
      handler: 'personio-import.handler'      // file is "personio-import", function is "handler"
    });

    // Creates state machine to run lambdas
    const stateMachine = new sfn.StateMachine(this, 'MyStateMachine', {
      definition:
        new tasks.LambdaInvoke(this, "ClockifyExport", {
          lambdaFunction: clockifyExportFunction
        }).next(
          new tasks.LambdaInvoke(this, "DataMapper", {
            lambdaFunction: dataMapperFunction
          })
        ).next(
          new tasks.LambdaInvoke(this, "PersonioImport", {
            lambdaFunction: personioImportFunction
          })
        ).next(
          new sfn.Succeed(this, "GreetedWorld")
        )
    });

    // EventBridge rule which triggers the state machine every day at 8pm
    new events.Rule(this, 'CronRule', {
      schedule: events.Schedule.expression('cron(0 20 * * *)')
    }).addTarget(new SfnStateMachine(stateMachine));
  }
}