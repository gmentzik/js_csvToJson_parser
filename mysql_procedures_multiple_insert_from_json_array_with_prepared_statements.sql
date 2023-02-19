-- MYSQL PROCEDURES USING PREPARED STATEMENTS TO LOOP THROUGH A JSON ARRAY OF OBJECTS TO INSERT MULTIPLE LINES
-- ATTENTION: PREPARED STATEMENTS USE SESSION WIDE VARIABLES , SO CONFLICTS MAY OCCURE IN CASE MULTIPLE PARALLEL CALLS TO SAME PROCEDURE IN SAME MYSQL SESSION.
-- UNQUOTE IS USED FOR TEXT EXPECTED INPUT JSON VALUE. FOR NUMBERS AND BOOLEANS IS NOT NEEDED.

--  SCENARIO PMI
CREATE DEFINER=`budibase`@`%` PROCEDURE `INSERT_MULTIPLE_SCENARIO_PMI_FROM_JSON_ARRAY`(in_sid int, in_array LONGTEXT)
    MODIFIES SQL DATA
    COMMENT 'Iterate an array and for each item execute an insert statement'
BEGIN
  DECLARE i INT UNSIGNED
    DEFAULT 0;
  DECLARE v_count INT UNSIGNED
    DEFAULT JSON_LENGTH(in_array);
  DECLARE v_current_item LONGTEXT
    DEFAULT NULL;

  DECLARE exit handler FOR SQLEXCEPTION
    BEGIN
      ROLLBACK;
      RESIGNAL;
    END;

  IF(v_count = 0) THEN 
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Json array is empty!';
  END IF;
  INSERT INTO `smt_scenario_import_report` (`scenario_id`,`result`) VALUES (in_sid, concat("pmi data: ",in_array));
  START TRANSACTION;
    -- delete all scenario entries at the handled table
    DELETE FROM `smt_per_module_input` WHERE `scenario_id` = in_sid;
    -- insert multiple rows
    PREPARE scenario_insert_pmt_stmt FROM 'INSERT INTO `smt_per_module_input` (`scenario_id`, `setting_id`, `module_input_value`) VALUES (?,?,?)';
    WHILE i < v_count DO
      -- get the current item 
      SET v_current_item = JSON_EXTRACT(in_array, CONCAT('$[', i, ']'));
      -- get json fields values
      SET @scenario_insert_pmt_v1 = JSON_EXTRACT(v_current_item, '$.scenario_id');
      SET @scenario_insert_pmt_v2 = JSON_EXTRACT(v_current_item, '$.setting_id');
      SET @scenario_insert_pmt_v3 = JSON_UNQUOTE(JSON_EXTRACT(v_current_item, '$.module_input_value'));
      -- execute insert
      EXECUTE scenario_insert_pmt_stmt USING @scenario_insert_pmt_v1, @scenario_insert_pmt_v2, @scenario_insert_pmt_v3;
      -- increase counter
      SET i := i + 1;
    END WHILE;
    DEALLOCATE PREPARE scenario_insert_pmt_stmt;
    INSERT INTO `smt_scenario_import_report` (`scenario_id`,`result`) VALUES (in_sid, concat(i," rows inserted to smt_per_module_input"));
  COMMIT;
END



--  SCENARIO VM
CREATE DEFINER=`budibase`@`%` PROCEDURE `INSERT_MULTIPLE_SCENARIO_VM_FROM_JSON_ARRAY`(in_sid int, in_array LONGTEXT)
    MODIFIES SQL DATA
    COMMENT 'Iterate an array and for each item execute an insert statement'
BEGIN
  DECLARE i INT UNSIGNED
    DEFAULT 0;
  DECLARE v_count INT UNSIGNED
    DEFAULT JSON_LENGTH(in_array);
  DECLARE v_current_item LONGTEXT
    DEFAULT NULL;

  DECLARE exit handler FOR SQLEXCEPTION
    BEGIN
      ROLLBACK;
      RESIGNAL;
    END;

  IF(v_count = 0) THEN 
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Json array is empty!';
  END IF;
  INSERT INTO `smt_scenario_import_report` (`scenario_id`,`result`) VALUES (in_sid, concat("vm data: ",in_array));
  START TRANSACTION;
    -- delete all scenario entries at the handled table
    DELETE FROM `smt_virtual_machine` WHERE `scenario_id` = in_sid;
    -- insert multiple rows
    PREPARE scenario_insert_vm_stmt FROM 'INSERT INTO `smt_virtual_machine` (`scenario_id`, `node_type_id`, `servers`,`vcpus`,`ram`,`storage`) VALUES (?,?,?,?,?,?)';
    WHILE i < v_count DO
      -- get the current item 
      SET v_current_item = JSON_EXTRACT(in_array, CONCAT('$[', i, ']'));
      -- get json fields values
      SET @scenario_insert_vm_v1 = JSON_EXTRACT(v_current_item, '$.scenario_id');
      SET @scenario_insert_vm_v2 = JSON_EXTRACT(v_current_item, '$.node_type_id');
      SET @scenario_insert_vm_v3 = JSON_EXTRACT(v_current_item, '$.servers');
      SET @scenario_insert_vm_v4 = JSON_EXTRACT(v_current_item, '$.vcpus');
      SET @scenario_insert_vm_v5 = JSON_EXTRACT(v_current_item, '$.ram');
      SET @scenario_insert_vm_v6 = JSON_EXTRACT(v_current_item, '$.storage');
      -- execute insert
      EXECUTE scenario_insert_vm_stmt USING @scenario_insert_vm_v1, @scenario_insert_vm_v2, @scenario_insert_vm_v3, 
                                            @scenario_insert_vm_v4, @scenario_insert_vm_v5, @scenario_insert_vm_v6;
      -- increase counter
      SET i := i + 1;
    END WHILE;
    DEALLOCATE PREPARE scenario_insert_vm_stmt;
    INSERT INTO `smt_scenario_import_report` (`scenario_id`,`result`) VALUES (in_sid, concat(i," rows inserted to smt_virtual_machine"));
  COMMIT;
END


-- CALLING MYSQL PROCEDURES FROM BUDIBASE:
-- In all cases scenario_id default is 0 and json is {}
CALL INSERT_MULTIPLE_SCENARIO_PMI_FROM_JSON_ARRAY({{scenarioId}},{{json}});
CALL INSERT_MULTIPLE_SCENARIO_VM_FROM_JSON_ARRAY({{scenarioId}},{{json}});
