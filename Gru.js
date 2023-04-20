var Gru = Class.create();

Gru.KEYS = ['number', 'u_number', 'user_name'];

/**SNDOC
    @name           getRecord
    @description    Get a record identified by sys_id, number, or any other unique attribute
    @param          {GlideRecord | String} [id] - Information known about the desired GlideRecord
    @param          {String} [table] - Database table name
    @returns        {GlideRecord} Null if DO NOT EXISTS (for the given table or its hierarchy).
*/
Gru.getRecord = function (id, table) {
    return this._getRecord(id, table);
};

/**SNDOC
    @name           getObject
    @description    Get an object identified by sys_id, number, or any other unique attribute
                    Apart from the listed fields, returned object always include the sys_id of the record.
    @param          {GlideRecord | String} [id] - Information known about the desired GlideRecord
    @param          {String} [table] - Database table name
    @param          {Array<String>} [fields] - Fields you want the object to contain about your record
    @returns        {Object} Null if DO NOT EXISTS (for the given table or its hierarchy).
*/
Gru.getObject = function (id, table, fields) {
    var record = this._getRecord(id, table);
    if (!record) return null;
    return new GlideQuery(record.getTableName())
        .where('sys_id', record.getUniqueValue())
        .selectOne(fields.split(','));
};

/**SNDOC
    @name           getChoiceOptions
    @description    Return the choice options for a given pair of record + attribute
    @param          {String} [table] - Table name
    @param          {String} [element] - Table field
    @param          {String} [language] - (Optional) Value language -- English by default
    @returns        {Array<Object>} [{name: <String>, label: <String>, value:<String>, dependentValue:<String>}, {...}]
*/
Gru.getChoiceOptions = function(table, field, language) {
    var choices = [];

    var grChoices = new GlideRecord('sys_choice');
    grChoices.addQuery('name', 'IN', Gru.getTableHierarchy(table)); //getRecordClassName
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
    @name           isValidChoiceOption
    @description    Check whether a choice-type attribute has a valid value.
    @param          {String} [table] - Table name
    @param          {String} [element] - Table field
    @param          {String} [value] - Field value
    @returns        {Boolean} 
*/
Gru.isValidChoiceOption = function(table, element, value) {
    ArrayPolyfill;
    var options = Gru.getChoiceOptions(table, element);
    return Boolean(options.find(function(option) {
        return option.value == value;
    }));
};

/**SNDOC
    @name           getTableHierarchy
    @description    Return an array including all the tables in the hierarchy for a given table
    @param          {String} [table] - Database table name
    @returns        {Array<String>} [<string>, ...]
*/
Gru.getTableHierarchy = function(table) {
    gs.include("j2js");
    var hierarchy = new TableUtils(table).getHierarchy();
    return j2js(hierarchy);
};

/**SNDOC
    @name           _getRecord
    @description    Get a GlideRecord object given the sys_id, number or GlideRecord. **It fails for new records 
                    using API method .initialize() instead of .newRecord()
    @param          {String|Object} [record] - sys_id | number | GlideRecord
    @param          {String} [tableName] - Database table name
    @returns        {GlideRecord} Gliderecord object
    @private
*/
Gru._getRecord = function(record, tableName) {
    var grRecord = new GlideRecord(tableName);
    grRecord.setLimit(1);
    
    // sys_id
    if (typeof(record) === 'string' && record.length === 32) {
        if (!grRecord.get(record)) {
            return null;
        }
        return Gru._returnGlideRecord(grRecord);
    }
    
    // keys
    else if (typeof(record) === 'string') {
        var fieldFound = false;
        var qc;
        
        Gru.KEYS.forEach(function(key) {
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

        return Gru._returnGlideRecord(grRecord);
    }
    
    // GlideRecord
    else if (record instanceof GlideRecord) {
        return Gru._returnGlideRecord(record);
    }
    
    return undefined;
};

/**SNDOC
    @name           _returnGlideRecord
    @description    Return a GlideRecord instantiated on the child class. It ensures that, for example, 
                    we don't return an incident instantiated on the task table
    @param          {GlideRecord} [grRecord] - Object instance of GlideRecord
    @returns        {GlideRecord} Object instance of GlideRecord instantiated in the child class
    @private
*/
Gru._returnGlideRecord = function(grRecord) {
    if (grRecord.getRecordClassName() !== grRecord.getTableName() && !grRecord.isNewRecord()) {
        var extRecord = new GlideRecord(grRecord.getRecordClassName());
        extRecord.get(grRecord.getUniqueValue());
        return extRecord;
    } 

    return grRecord;
};