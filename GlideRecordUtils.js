var GlideRecordUtils = Class.create();

/**SNDOC
    @name getRecord
    @description Get a record representd by sys_id, number, or any other unique attribute
    @param {GlideRecord | String} [id] - Information known about the desired GlideRecord
    @param {String} [tableName] - (Optional in case id is a GlideRecord itself). Database table name
    @returns {GlideRecord} Null if DO NOT EXISTS (for the given table or its hierarchy). Undefined if NOT FOUND (without guaranteeing it does not exist)
    @example 
        GlideRecordUtils.getRecord('INC0000001', 'task').getRecordClassName(); // result: incident
        GlideRecordUtils.getRecord('9c573169c611228700193229fff72400', 'incident').getDisplayValue(); // result: INC0000001
        var gr = new GlideRecord('incident'); gr.get('9c573169c611228700193229fff72400'); GlideRecordUtils.getRecord(gr).getDisplayValue(); // result: INC0000001
        GlideRecordUtils.getRecord('INC-0000001', 'task'); // result: null
*/
GlideRecordUtils.getRecord = function (id, tableName) {
    var table = GlideRecordUtils._getTableName(id, tableName);
    return this._getRecord(id, table);
};

/**SNDOC
    @name getChoiceOptions
    @description Return the choice options for a given pair of record + attribute
    @param {String} [table] - Table name
    @param {String} [element] - Table field
    @param {String} [language] - (Optional) Value language -- English by default
    @returns {Array<Object>} [{name: <String>, label: <String>, value:<String>, dependentValue:<String>}, {...}]
    @example 
        GlideRecordUtils.getChoiceOptions('incident', 'state'); // result: [{ "table": "incident", "label": "New", "value": "1", "dependentValue": null }, {...}]
*/
GlideRecordUtils.getChoiceOptions = function(table, field, language) {
    var choices = [];

    var grChoices = new GlideRecord('sys_choice');
    grChoices.addQuery('name', 'IN', GlideRecordUtils.getTableHierarchy(table)); //getRecordClassName
    grChoices.addQuery('element', field);
    grChoices.addQuery('language', language || 'en');
    grChoices.addQuery('inactive', false);
    grChoices.query();
    
    while (grChoices.next()) {
        choices.push({
            table: grChoices.getValue('name'),
            label: grChoices.getValue('label'),
            value: grChoices.getValue('value'),
            dependentValue: grChoices.getValue('dependent_value')
        });
    }

    return choices;
};

/**SNDOC
    @name isValidChoiceOption
    @description Check whether a choice-type attribute has a valid value.
    @param {String} [table] - Table name
    @param {String} [element] - Table field
    @param {String} [value] - Field value
    @returns {Boolean} 
    @example
        GlideRecordUtils.isValidChoiceOption('incident', 'state', '1'); // result: true
        GlideRecordUtils.isValidChoiceOption('incident', 'state', 'wrongValue') // result: false
*/
GlideRecordUtils.isValidChoiceOption = function(table, element, value) {
    ArrayPolyfill;
    var options = GlideRecordUtils.getChoiceOptions(table, element);
    return Boolean(options.find(function(option) {
        return option.value == value;
    }));
};

/**SNDOC
    @name getTableHierarchy
    @description Return an array including all the tables in the hierarchy for a given table
    @param {String} [table] - Database table name
    @returns {Array<String>} [<string>, ...]
    @example
        GlideRecordUtils.getTableHierarchy('cmdb_ci_linux_server'); // result: ["cmdb_ci_linux_server", "cmdb_ci_server", "cmdb_ci_computer", "cmdb_ci_hardware", "cmdb_ci", "cmdb"]
*/
GlideRecordUtils.getTableHierarchy = function(table) {
    gs.include("j2js");
    var hierarchy = new TableUtils(table).getHierarchy();
    return j2js(hierarchy);
};

/**SNDOC
    @name _getRecord
    @description Get a GlideRecord object given the sys_id, number or GlideRecord. **It fails for new records using API method .initialize() instead of .newRecord()
    @param {String|Object} [record] - sys_id | number | GlideRecord
    @param {String} [tableName] - Database table name
    @returns {GlideRecord} Gliderecord object
    @private
*/
GlideRecordUtils._getRecord = function(record, tableName) {
    var grRecord = new GlideRecord(tableName);
    grRecord.setLimit(1);
    
    // sys_id
    if (typeof(record) === 'string' && record.length === 32) {
        if (!grRecord.get(record)) {
            return null;
        }
        return GlideRecordUtils._returnGlideRecord(grRecord);
    }
    
    // keys
    else if (typeof(record) === 'string') {
        var keys = gs.getProperty('gliderecordutils.keys', 'number, u_number, user_name').split(',');
        var fieldFound = false;
        var qc = undefined;
        
        keys.forEach(function(key) {
            //keysArr[0]
            if (grRecord.isValidField(key) && !fieldFound) {
                fieldFound = true;
                qc = grRecord.addQuery(key, record);
            }

            //keysArr[1,n]
            else if (grRecord.isValidField(key) && fieldFound) {
                qc.addOrCondition(key, record);
            }
        });

        grRecord.query();

        if (!grRecord.next()) {
            return null;
        }

        return GlideRecordUtils._returnGlideRecord(grRecord);
    }
    
    // GlideRecord
    else if (record instanceof GlideRecord) {
        return GlideRecordUtils._returnGlideRecord(record);
    }
    
    return undefined;
};

/**SNDOC
@name name
@description This method is call before attempting to get a record. If the table name is passed in as a parameter, method just return it. In the case it receives a GlideRecord as a first parameter, method obtains the class name
@param {unknown} [record] - Data passed in to method getRecord trying to obtain a GlideRecord
@param {String} [tableName] - Optional parameter. Database table name
@returns {String} Database table name. Undefined if it couldn't be fetched
@private
*/
GlideRecordUtils._getTableName = function (record, tableName) {
    if (tableName) {
        return tableName;
    }

    if (record instanceof GlideRecord) {
        return record.getRecordClassName();
    }

    return undefined;
};

/**SNDOC
    @name _returnGlideRecord
    @description Return a GlideRecord instantiated on the child class. It ensures that, for example, we don't return an incident instantiated on the task table
    @param {GlideRecord} [grRecord] - Object instance of GlideRecord
    @returns {GlideRecord} Object instance of GlideRecord instantiated in the child class
    @private
*/
GlideRecordUtils._returnGlideRecord = function(grRecord) {
    if (grRecord.getRecordClassName() !== grRecord.getTableName() && !grRecord.isNewRecord()) {
        var extRecord = new GlideRecord(grRecord.getRecordClassName());
        extRecord.get(grRecord.getUniqueValue());
        return extRecord;
    } 

    return grRecord;
};