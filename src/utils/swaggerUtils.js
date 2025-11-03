import jsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "Router Users"
        }
    },
    apis: ["./src/docs/*.yaml"]
}

export const specs = jsdoc(options);