    <?php
    $modal_input = isset($_POST["formData"]) ? $_POST["formData"] : null;
    $keywords = preg_split("/[\s,]+/", $modal_input);
    $GLOBALS["returnArray"] = [];
    $GLOBALS["jsonKeys"] = json_decode(file_get_contents("parameters.json"));


    foreach ($keywords as $kw) {
        keywordParseReturn($kw);
    }
    returnData();
    

    function keywordParseReturn($keyword) {
        if (preg_match("/^[0-9]*$/", $keyword)) {
            $GLOBALS["returnArray"]["Age"] = $keyword;
        } else if (in_array(ucfirst($keyword), $GLOBALS["jsonKeys"]->Sex)) {
            $GLOBALS["returnArray"]["Sex"] = $keyword;
        } else if (in_array(ucfirst($keyword), $GLOBALS["jsonKeys"]->Ethnicity)) {
            $GLOBALS["returnArray"]["Ethnicity"] = $keyword;
        } else {
//            foreach ($GLOBALS["jsonKeys"] as $jsonElt) {
// echo $jsonElt;
// }
        }
        
    }

    function returnData(){
        echo json_encode($GLOBALS["returnArray"]);
    }
    

    ?>
