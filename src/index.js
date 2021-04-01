const dynamoose = require('dynamoose')

dynamoose.aws.sdk.config.update({
  accessKeyId: 'local',
  region: 'local',
  secretAccessKey: 'local'
})

dynamoose.aws.ddb.local("http://localhost:8000");

const schema = new dynamoose.Schema({
  idempotency_key: {
    type: String,
    hashKey: true,
    required: true,
  },
  transaction_id: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: null,
  },
})

const tableName = `wallstreet-payables-wrk`

const modelConfig = {
  throughput: 'ON_DEMAND',
  expires: {
    ttl: 36000000,
    attribute: 'ttl',
  },
}

const Model = dynamoose.model(tableName, schema, modelConfig)

const run = async () => {
  try {
    const idempotencyKey = 'ckk8wku0a6lge0gm5j37n3dk' + Math.random() * 10000;
    const model = new Model({
      "idempotency_key": idempotencyKey,
      "transaction_id": '278370205',
      "message": JSON.stringify({ message: 'hello world' })
    });

    await model.save({ overwrite: false })

    const data = await Model.query({
      idempotency_key: {
        eq: String(idempotencyKey),
      },
    })
      .limit(1)
      .exec()

    if(!data) {
      console.log({
        message: 'Not found item dynamodb',
        data: !data[0]
      })
    }

    console.log({  message: 'Created item dynamodb',
      message: 'Created item dynamodb',
      data: !!data[0],
      timestamps: new Date()
    })
    setInterval(run, 1)
  } catch (error) {
    console.log({
      message: 'Failed item dynamodb',
      error: error.message,
      stack: error.stack.split('\n'),
    })
  }
}


run()