/*
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is
 * regenerated.
 */

'use strict';

const models = require('./index');

/**
 * Class representing a OSes.
 */
class OSes {
  /**
   * Create a OSes.
   * @member {number} [total]
   * @member {array} [oses]
   */
  constructor() {
  }

  /**
   * Defines the metadata of OSes
   *
   * @returns {object} metadata of OSes
   *
   */
  mapper() {
    return {
      required: false,
      serializedName: 'OSes',
      type: {
        name: 'Composite',
        className: 'OSes',
        modelProperties: {
          total: {
            required: false,
            serializedName: 'total',
            type: {
              name: 'Number'
            }
          },
          oses: {
            required: false,
            serializedName: 'oses',
            type: {
              name: 'Sequence',
              element: {
                  required: false,
                  serializedName: 'OSElementType',
                  type: {
                    name: 'Composite',
                    className: 'OS'
                  }
              }
            }
          }
        }
      }
    };
  }
}

module.exports = OSes;
