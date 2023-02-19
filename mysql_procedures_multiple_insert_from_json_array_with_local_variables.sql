-- -----------------------------------------------------
-- MYSQL PROCEDURES USING PREPARED STATEMENTS TO LOOP THROUGH A JSON ARRAY OF OBJECTS TO INSERT MULTIPLE LINES
-- UNQUOTE IS USED FOR TEXT EXPECTED INPUT JSON VALUE. FOR NUMBERS AND BOOLEANS IS NOT NEEDED.
-- Update of Mysql procedures for Import CSV
-- -----------------------------------------------------
-- Note: Previous version of procedures used Session variables and there was a risk of confict in case procedure called in parralel in same session. 
-- New version of those was implemented to used local procedure variables to avoid the posibbility of such case

-- SQL START
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
  
  DECLARE l_sid INT DEFAULT null;
  DECLARE l_setid INT DEFAULT null;  
  DECLARE l_miv VARCHAR(255) DEFAULT null;
  
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
    
    DELETE FROM `smt_per_module_input` WHERE `scenario_id` = in_sid;
    
    WHILE i < v_count DO
      
      SET v_current_item = JSON_EXTRACT(in_array, CONCAT('$[', i, ']'));
      
      SET l_sid = JSON_EXTRACT(v_current_item, '$.scenario_id');
      SET l_setid = JSON_EXTRACT(v_current_item, '$.setting_id');
      SET l_miv = JSON_UNQUOTE(JSON_EXTRACT(v_current_item, '$.module_input_value'));
      
      INSERT INTO `smt_per_module_input` (`scenario_id`, `module_input_value`, `setting_id`) VALUES (l_sid,l_miv,l_setid);
      
      SET i := i + 1;
    END WHILE;
    INSERT INTO `smt_scenario_import_report` (`scenario_id`,`result`) VALUES (in_sid, concat(i," rows inserted to smt_per_module_input"));
  COMMIT;
END
-- SQL END

-- SQL START
CREATE DEFINER=`budibase`@`%` PROCEDURE `INSERT_MULTIPLE_SCENARIO_TENANT_FROM_JSON_ARRAY`(in_sid int, in_array LONGTEXT)
    MODIFIES SQL DATA
    COMMENT 'Iterate an array and for each item execute an insert statement'
BEGIN
  DECLARE i INT UNSIGNED
    DEFAULT 0;
  DECLARE v_count INT UNSIGNED
    DEFAULT JSON_LENGTH(in_array);
  DECLARE v_current_item LONGTEXT
    DEFAULT NULL;
  
  DECLARE l_sid INT DEFAULT null;
  DECLARE l_opcoid INT DEFAULT null;
  DECLARE l_flavor VARCHAR(10) DEFAULT null;  
  DECLARE l_swran VARCHAR(255) DEFAULT null;
  DECLARE l_cells INT DEFAULT null;
  DECLARE l_nodes INT DEFAULT null;
  DECLARE l_oss INT DEFAULT null;
  DECLARE l_bscrnc INT DEFAULT null;
  
  DECLARE exit handler FOR SQLEXCEPTION
    BEGIN
      ROLLBACK;
      RESIGNAL;
    END;

  IF(v_count = 0) THEN 
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Json array is empty!';
  END IF;
  INSERT INTO `smt_scenario_import_report` (`scenario_id`,`result`) VALUES (in_sid, concat("tenant data: ",in_array));
  START TRANSACTION;
    
    DELETE FROM `smt_tenant` WHERE `scenario_id` = in_sid;
    
    WHILE i < v_count DO
      
      SET v_current_item = JSON_EXTRACT(in_array, CONCAT('$[', i, ']'));
      
      SET l_sid= JSON_EXTRACT(v_current_item, '$.scenario_id');
      SET l_opcoid = JSON_EXTRACT(v_current_item, '$.opco_id');
      SET l_flavor = JSON_UNQUOTE(JSON_EXTRACT(v_current_item, '$.flavor_code'));
      SET l_swran = JSON_UNQUOTE(JSON_EXTRACT(v_current_item, '$.sw_ran_release'));
      SET l_cells = JSON_EXTRACT(v_current_item, '$.cells_count');
      SET l_nodes = JSON_EXTRACT(v_current_item, '$.nodes_count');
      SET l_oss = JSON_EXTRACT(v_current_item, '$.oss_instances');
      SET l_bscrnc = JSON_EXTRACT(v_current_item, '$.bsc_rnc_count');
      
      INSERT INTO `smt_tenant` (`scenario_id`, `opco_id`, `flavor_code`, `sw_ran_release`, `cells_count`, `nodes_count`, `oss_instances`, `bsc_rnc_count`) 
      VALUES (l_sid,l_opcoid,l_flavor,l_swran,l_cells,l_nodes,l_oss,l_bscrnc);
      
      SET i := i + 1;
    END WHILE;
    INSERT INTO `smt_scenario_import_report` (`scenario_id`,`result`) VALUES (in_sid, concat(i," rows inserted to smt_tenant"));
  COMMIT;
END
-- SQL END

-- SQL START
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
  
  DECLARE l_sid INT DEFAULT null;
  DECLARE l_nodeid INT DEFAULT null;
  DECLARE l_servers VARCHAR(10) DEFAULT null;  
  DECLARE l_vcpus VARCHAR(255) DEFAULT null;
  DECLARE l_ram INT DEFAULT null;
  DECLARE l_storage DOUBLE DEFAULT null;
  
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
    
    DELETE FROM `smt_virtual_machine` WHERE `scenario_id` = in_sid;
    
    WHILE i < v_count DO
      
      SET v_current_item = JSON_EXTRACT(in_array, CONCAT('$[', i, ']'));
      
      SET l_sid = JSON_EXTRACT(v_current_item, '$.scenario_id');
      SET l_nodeid = JSON_EXTRACT(v_current_item, '$.node_type_id');
      SET l_servers = JSON_EXTRACT(v_current_item, '$.servers');
      SET l_vcpus = JSON_EXTRACT(v_current_item, '$.vcpus');
      SET l_ram = JSON_EXTRACT(v_current_item, '$.ram');
      SET l_storage = JSON_EXTRACT(v_current_item, '$.storage');
      
      INSERT INTO `smt_virtual_machine` (`scenario_id`, `node_type_id`, `servers`,`vcpus`,`ram`,`storage`) 
      VALUES (l_sid,l_nodeid,l_servers,l_vcpus,l_ram,l_storage);
      
      SET i := i + 1;
    END WHILE;
    INSERT INTO `smt_scenario_import_report` (`scenario_id`,`result`) VALUES (in_sid, concat(i," rows inserted to smt_virtual_machine"));
  COMMIT;
END
-- SQL END