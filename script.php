    <?php
    $modal_input = isset($_POST["formData"]) ? $_POST["formData"] : null;
    $keywords = preg_split("/(?:\s+)(?:(?![^']*'(?:[: ]|$)))/U", $modal_input);
    $GLOBALS["match_count"] = 0;
    $GLOBALS["returnArray"] = [];
    $GLOBALS["jsonKeys"] = json_decode(file_get_contents("parameters.json"));
    $autofill_file = fopen("parameters.json", 'rb');
    $autofill_json = json_decode(fread($autofill_file, filesize("parameters.json")), true);
    $med_count = 0;
    //echo print_r($autofill_json["lab-type-"]);
    fclose($autofill_file);
    //echo gettype($autofill_json);

    foreach ($keywords as $kw) { // For each keyword that was entered
        keywordMatcher($kw); // find if it matches any categories.
    }
    updateJSON();
    returnData();
    

    function keywordMatcher($keyword) {
        global $autofill_json, $med_count;
        if (preg_match("/^[0-9][0-9]*$/", $keyword)) {  // Age matches any sequence of numbers
            $GLOBALS["returnArray"]["Age"] = $keyword;
            
        } else if (in_array(str_replace("'", '', strtolower($keyword)), $GLOBALS["jsonKeys"]->Sex)) { // Gender matches a predefined set of keywords
            $GLOBALS["returnArray"]["Sex"] = ucwords(str_replace("'", '', $keyword));
        } else if (in_array(str_replace("'", '', strtolower($keyword)), $GLOBALS["jsonKeys"]->Ethnicity)) {   // Ethnicity matches a predefined set of keywords.
            $GLOBALS["returnArray"]["Ethnicity"] = ucwords(str_replace("'", '', $keyword));    
        } else if (preg_match("/^'[^']*':'[^']*':'[^']*'$/U", $keyword) or preg_match("/^'[^']*':'[^']*':'[^']*':'[^']*'$/U", $keyword)) { // Labs match the format 'Name':'Value':'Unit':'Statement'
            $lab_matches3 = [];     // Two arrays to account for the optional 4th parameter                                                           
            preg_match_all("/^'[^']*':'[^']*':'[^']*'$/U",$keyword,$lab_matches3);    // Does the same thing twice, one for 4 parm entries and one for 3
            
            $lab_matches4 = [];                                                                   
            preg_match_all("/^'[^']*':'[^']*':'[^']*':'[^']*'$/U",$keyword,$lab_matches4);
            
            foreach ($lab_matches3[0] as $match) {    
                if (!$match) {
                    break;
                }
                // This exceedingly long regex is necessary to allow colons inside the input 
                $split_match3 = preg_split("/(?::)(?=(?:(?:'[^']*')|(?:'[^']*':'[^']*')|'[^']*':'[^']*':'[^']*')(?:$| ))/", $match);
                
                $GLOBALS["returnArray"]["Labs"][$GLOBALS["match_count"]]["Lab Name"] = str_replace("'", '', $split_match3[0]);
                $GLOBALS["returnArray"]["Labs"][$GLOBALS["match_count"]]["Lab Value"] = str_replace("'", '', $split_match3[1]);
                $GLOBALS["returnArray"]["Labs"][$GLOBALS["match_count"]]["Lab Units"] = str_replace("'", '', $split_match3[2]);
                
                //echo in_array(str_replace("'",'',$split_match3[0]), $autofill_json["lab-type-"]);
                if (!in_array(str_replace("'",'',$split_match3[0]), $autofill_json["lab-type-"])){
                    
                    array_push($autofill_json["lab-type-"], str_replace("'",'',$split_match3[0])); 
                }
                if (!in_array(str_replace("'",'',$split_match3[1]), $autofill_json["lab-result-"])){
                    array_push($autofill_json["lab-result-"], str_replace("'",'',$split_match3[1])); 
                }
                if (!in_array(str_replace("'",'',$split_match3[2]), $autofill_json["lab-units-"])){
                    array_push($autofill_json["lab-units-"], str_replace("'",'',$split_match3[2])); 
                }
                
                $GLOBALS["match_count"] += 1;
            }
            foreach ($lab_matches4[0] as $match) {
                if (!$match) {
                    break;
                }
                //print_r($match);
                //echo '<script>console.log('.$match.')</script>';
                $split_match4 = preg_split("/(?::)(?=(?:(?:'[^']*')|(?:'[^']*':'[^']*')|'[^']*':'[^']*':'[^']*')(?:$| ))/", $match);
                $GLOBALS["returnArray"]["Labs"][$GLOBALS["match_count"]]["Lab Name"] = str_replace("'", '', $split_match4[0]);
                $GLOBALS["returnArray"]["Labs"][$GLOBALS["match_count"]]["Lab Value"] = str_replace("'", '', $split_match4[1]);
                $GLOBALS["returnArray"]["Labs"][$GLOBALS["match_count"]]["Lab Units"] = str_replace("'", '', $split_match4[2]);
                $GLOBALS["returnArray"]["Labs"][$GLOBALS["match_count"]]["Lab Statement"] = str_replace("'", '', $split_match4[3]);
                $GLOBALS["match_count"] += 1;
            }
        } else if (preg_match("/^'[^']*':'[^']*':'[^']*':'[^']*':'[^']*':'[^']*':'[^']*'$/U", $keyword)) {
            $med_matches = [];
            preg_match("/^'[^']*':'[^']*':'[^']*':'[^']*':'[^']*':'[^']*':'[^']*'$/U", $keyword, $med_matches);
            $split_meds = preg_split("/(?::)(?=(?:(?:'[^']*')|(?:'[^']*':'[^']*')|'[^']*':'[^']*':'[^']*'|'[^']*':'[^']*':'[^']*':'[^']*'|'[^']*':'[^']*':'[^']*':'[^']*':'[^']*'|'[^']*':'[^']*':'[^']*':'[^']*':'[^']*':'[^']*')(?:$| ))/", $keyword);
            $GLOBALS["returnArray"]["Meds"][$med_count]["Medication Name"] = str_replace("'", '', $split_meds[0]);
            $GLOBALS["returnArray"]["Meds"][$med_count]["Medication Strength"] = str_replace("'", '', $split_meds[1]);
            $GLOBALS["returnArray"]["Meds"][$med_count]["Medication Dose"] = str_replace("'", '', $split_meds[2]);
            $GLOBALS["returnArray"]["Meds"][$med_count]["Medication Route"] = str_replace("'", '', $split_meds[3]);
            $GLOBALS["returnArray"]["Meds"][$med_count]["Medication Timing/Frequency"] = str_replace("'", '', $split_meds[4]);
            $GLOBALS["returnArray"]["Meds"][$med_count]["Selection Criteria"] = str_replace("'", '', $split_meds[5]);
            $GLOBALS["returnArray"]["Meds"][$med_count]["Before / After"] = str_replace("'", '', $split_meds[6]);
            $med_count += 1;
        } else if (preg_match("/^'[^']*':'[^']*'$/U", $keyword)) {
            $parameter = preg_split("/(?::)(?=(?:(?:'[^']*')|(?:'[^']*':'[^']*')|'[^']*':'[^']*':'[^']*')(?:$| ))/", $keyword);
            //echo "0000".$parameter[0]."0000";
            //echo "1111".$parameter[1]."1111";
            $parameter[0] = str_replace("'", '', $parameter[0]);
            $parameter[1] = str_replace("'", '', $parameter[1]);
            if (strcmp($parameter[0], 'c') == 0) { // Chief Complaint
                
                $GLOBALS["returnArray"]["Chief Complaint"] = $parameter[1];
                
            } else if (strcmp($parameter[0], 'f') == 0) {  // Family History
                
                $GLOBALS["returnArray"]["Family History"] = $parameter[1];
                
            } else if (strcmp($parameter[0], 'h') == 0) {  // HPI
                
                 $GLOBALS["returnArray"]["HPI"] = $parameter[1];
                
            } else if (strcmp($parameter[0], 'pm') == 0) { // PMH
                
                 $GLOBALS["returnArray"]["PMH"] = $parameter[1];
                
            } else if (strcmp($parameter[0], 'pi') == 0) { // Physical Info
                
                 $GLOBALS["returnArray"]["Physical Info"] = $parameter[1];
                
            } else if (strcmp($parameter[0], 'r') == 0) {  // Role
                
                 $GLOBALS["returnArray"]["Role"] = $parameter[1];
                
            } else if (strcmp($parameter[0], 'sh') == 0) { // Self Health
                
                 $GLOBALS["returnArray"]["Self Health"] = $parameter[1];
                
            } else if (strcmp($parameter[0], 's') == 0) {  // Social Hisotry
                
                 $GLOBALS["returnArray"]["Social History"] = $parameter[1];
                
            } else if (strcmp($parameter[0], 'w') == 0) {  // Working With
                
                 $GLOBALS["returnArray"]["Working With"] = $parameter[1];
                
            } else if(strcmp($parameter[0], 't') == 0) {
                
                 $GLOBALS["returnArray"]["Task"] = $parameter[1];
                
            }
        }
        
    }

    function returnData(){
        echo json_encode($GLOBALS["returnArray"]);
    }

    function updateJSON() {
        global $autofill_json;
        $autofill_file = fopen("parameters.json", 'wb');
        fwrite($autofill_file, json_encode($autofill_json));
        fclose($autofill_file);
        
    }
    

    ?>
