const schemaCount = {
    schema: {
  		response: {
    		'200': {
      			type: 'object',
     			 properties: {
        			total: { type: 'integer' },
        			rows: { 
           				type: 'array',
            			items: { 
                			type: 'object',
                			properties: {
                 				name: {type: 'string'},
                    			uuid: {type: 'string'},
                    			total: {type: 'integer'}
                    		}
            			}
                   	}
      			}
    		}
  		}
    }
}

const schemaRecord = {
    schema: {
  		response: {
    		'200': {
      			type: 'object',
     			 properties: {
        			total: { type: 'integer' },
        			rows: { 
           				type: 'array',
            			items: { 
                			type: 'object',
                			properties: {
                 				name: {type: 'string'},
                    			uuid: {type: 'string'},
                                event: {type: 'string'},
                    			date: {type: 'string'},
                                server: {type: 'string'}
                    		}
            			}
                   	}
      			}
    		}
  		}
    }
}

modules.export = {
    schemaCount: schemaCount,
    schemaRecord: schemaRecord
}