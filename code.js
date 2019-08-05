var patientName = '';
var populated = false;

$(document).ready(function () {
    var initNum = 0;
    var changeNum = 0;
    var afterNum = 0;
    var mostRecentLabNum = 0;
    var mostRecentLabStatementNum = 0;
    var mostRecentTab = "#custom-container";
    var goingToQuickTab = false;
    var testTags = ["Jim", "Bob", "Pat", "Tom"];
    var request;


    $(".ui-autocomplete").css("font-size", "2em");
    $(".ui-autocomplete").css("background", "2em");

    $("input").prop("autocomplete", "new-password");

    $(":text").autocomplete({
        source: function (request, response) {
            var selfID = $(this.element[0]).prop("id");
            var selfClass = $(this.element[0]).prop("class");
            $.getJSON("parameters.json", {
                query: request.term
            }, function (data) {
                console.log(request.term);
                $.each(data, function (key, val) {
                    if (selfID.includes(key.toLowerCase())) {
                        console.log("Key: " + key + ", ID: " + selfID);
                    }
                    if (key.toLowerCase() == selfID || selfID.includes(key.toLowerCase())) {
                        data = val.filter(item => item.includes(request.term));
                        response(data);
                    }
                });
            });
        }
    });

    $("#otherRadio").click(function () {
        $("#otherGender").prop("disabled", false);
    });

    $(".disable-other").click(function () {
        $("#otherGender").prop("disabled", true);
    });

    $(".modal-return").click(function () {
        var goBackTab = mostRecentTab.split("-")[0] + "-tab";
        //debugger; // Just checking to see if this ever gets hit
        $(mostRecentTab).siblings().css("display", "none");
        $(mostRecentTab).css("display", "block");
        $(goBackTab).parent().siblings().removeClass("active");
        $(goBackTab).parent().addClass("active disabled");
        $("#quick-modal-input").val('');
        $("#quick-modal-proceed").prop("disabled", true);
        $("#quick-modal-proceed").removeClass("btn-primary").addClass("btn-secondary");
    });

    $("#modal-proceed").click(function () {
        $("input").val('');
        $("[type='radio']").prop("checked", false);
        $("#exampleModal").modal("hide");
        $("#preview").html('');
        if (goingToQuickTab) {
            $("#quick-modal").modal({
                "backdrop": "static",
                "show": true,
                "keyboard": false
            });
        }
    });




    $("#quick-tab").click(function () {
        var text_value = '';
        goingToQuickTab = true;
        if ($("#quick-container").css("display") === "none") {
            mostRecentTab = "#" + $(".container").filter(function () {
                return $(this).css("display") === "block";
            }).prop("id");
            $(mostRecentTab + " :text," + mostRecentTab + " textarea").each(function () {
                text_value += $(this).val();
            });
            if (text_value != '') {
                $("#exampleModal").modal({
                    "backdrop": "static",
                    "show": true,
                    "keyboard": false
                });
            } else {
                $("#quick-modal").modal({
                    "backdrop": "static",
                    "show": true,
                    "keyboard": false
                });
            }
            $("#custom-container").css("display", "none");
            $("#template-container").css("display", "none");
            $("#quick-container").css("display", "block");
            $(this).parent().siblings().removeClass("active");
            $(this).parent().addClass("active disabled");
        }

    });

    //$("#quick-tab").click(); // REMOVE AFTER DEBUGGING DONE


    $("#template-tab").click(function () {
        goingToQuickTab = false;
        if ($("#template-container").css("display") === "none") {
            mostRecentTab = "#" + $(".container").filter(function () {
                return $(this).css("display") === "block";
            }).prop("id");
            $(":text, textarea").each(function () {
                var text_value = $(this).val();
                if (text_value != '') {
                    $("#exampleModal").modal({
                        "backdrop": "static",
                        "show": true,
                        "keyboard": false
                    })
                }
            })
            $("#custom-container").css("display", "none");
            $("#quick-container").css("display", "none");
            $("#template-container").css("display", "block");
            $(this).parent().siblings().removeClass("active");
            $(this).parent().addClass("active");
        }

    });

    $("#custom-tab").click(function () {
        goingToQuickTab = false;
        if ($("#custom-container").css("display") === "none") {
            mostRecentTab = "#" + $(".container").filter(function () {
                return $(this).css("display") === "block";
            }).prop("id");
            $(":text, textarea").each(function () {
                var text_value = $(this).val();
                if (text_value != '') {
                    $("#exampleModal").modal({
                        "backdrop": "static",
                        "show": true,
                        "keyboard": false
                    })
                }
            })
            $("#quick-container").css("display", "none");
            $("#template-container").css("display", "none");
            $("#custom-container").css("display", "block");
            $(this).parent().siblings().removeClass("active");
            $(this).parent().addClass("active");
        }

    });

    $("#custom-container").on("keyup", "input,textarea", function () {
        $("#preview").html(makeCustomString().replace(/\\r\\n/g, "<br/>"));
    });

    $(document).on("keyup", "#quick-modal-input", function () {
        $("#quick-modal-proceed").prop("disabled", false);
        $("#quick-modal-proceed").removeClass("btn-secondary").addClass("btn-primary");
    });

    $("#custom-container,#quick-container").on("keyup", ".med-names", function () {
        if ($(this).val()) {
            $(this).parent().parent().find(".enable-on-name").attr("disabled", false);
        } else {
            $(this).parent().parent().find(".enable-on-name").attr("disabled", true);
        }
    });

    $(document).on("keyup", ".lab-types", function () {
        if ($(this).val()) {
            $(this).parent().parent().find(".disabled-labs").attr("disabled", false);
        } else {
            $(this).parent().parent().find(".disabled-labs").attr("disabled", true);
        }
    });

    $(document).on("keyup", ".disabled-labs", function () {
        if ($(this).val()) {
            $(this).parent().parent().find(".last-disabled-labs").attr("disabled", false);
        } else {
            $(this).parent().parent().find(".last-disabled-labs").attr("disabled", true);
        }
    });



    $(".remove-meds").click(function () {
        console.log("Remove clicked");
        $(this).parent().find("[id^=med-info-]:last").remove()
        if ($(this).parent().find("[id^=med-info-]").length == 1) {
            $(this).attr("disabled", true);
        }
    });

    $(".add-meds").click(function () {
        console.log("Add clicked");
        var $div = $(this).parent().find("[id^=med-info-]:last");
        var $allEntries = $(this).parent().find("[id^=med-info-]");
        // Read the Number from that DIV's ID (i.e: 3 from "med-info-3")
        // And increment that number by 1
        initNum = parseInt($div.prop("id").match(/\d+/g), 10) + 1;

        if ($(this).parent().attr("id") === "meds-on-presentation" || $(this).parent().attr("id") === "meds-changed" || $(this).parent().attr("id") === "meds-after") {
            var $medInfo = $div.clone().prop('id', 'med-info-' + initNum);
            $medInfo.find("input").val('');
            $medInfo.find("[id^=med-name-]").attr("id", "med-name-" + initNum);
            $medInfo.find("[for^=med-name-]").attr("for", "med-name-" + initNum);
            $medInfo.find("[id^=med-strength-]").attr({
                "id": "med-strength-" + initNum,
                "disabled": true
            });
            $medInfo.find("[for^=med-strength-]").attr("for", "med-strength-" + initNum);
            $medInfo.find("[id^=med-dose-]").attr({
                "id": "med-dose-" + initNum,
                "disabled": true
            });
            $medInfo.find("[for^=med-dose-]").attr("for", "med-dose-" + initNum);
            $medInfo.find("[id^=med-route-]").attr({
                "id": "med-route-" + initNum,
                "disabled": true
            });
            $medInfo.find("[for^=med-route-]").attr("for", "med-route-" + initNum);
            $medInfo.find("[id^=med-timing-]").attr({
                "id": "med-timing-" + initNum,
                "disabled": true
            });
            $medInfo.find("[for^=med-timing-]").attr("for", "med-timing-" + initNum);
            $medInfo.find("[id^=med-selection-criteria-]").attr({
                "id": "med-selection-criteria-" + initNum,
                "disabled": true
            });
            $medInfo.find("[for^=med-selection-criteria-]").attr("for", "med-selection-criteria-" + initNum);
            var x = $allEntries.length;
            for (i = x; i > initNum; i--) {
                var $tempEntry = $('#' + $allEntries[i - 1].id).clone();
                $tempEntry.prop("id", "med-info-" + i);
                $tempEntry.find("[id^=med-name-]").attr("id", "med-name-" + i);
                $tempEntry.find("[for^=med-name-]").attr("for", "med-name-" + i);
                $tempEntry.find("[id^=med-strength-]").attr("id", "med-strength-" + i);
                $tempEntry.find("[for^=med-strength-]").attr("for", "med-strength-" + i);
                $tempEntry.find("[id^=med-dose-]").attr("id", "med-dose-" + i);
                $tempEntry.find("[for^=med-dose-]").attr("for", "med-dose-" + i);
                $tempEntry.find("[id^=med-route-]").attr("id", "med-route-" + i);
                $tempEntry.find("[for^=med-route-]").attr("for", "med-route-" + i);
                $tempEntry.find("[id^=med-timing-]").attr("id", "med-timing-" + i);
                $tempEntry.find("[for^=med-timing-]").attr("for", "med-timing-" + i);
                $tempEntry.find("[id^=med-selection-criteria-]").attr("id", "med-selection-criteria-" + i);
                $tempEntry.find("[for^=med-selection-criteria-]").attr("for", "med-selection-criteria-" + i);
                $('#' + $allEntries[i - 1].id).parent().find(".add-meds").before($tempEntry).html(); // Add entry to end of current section
                $('#' + $allEntries[i - 1].id).remove(); // Remove old one
            }
        } else if ($(this).parent().attr("id") === "meds-quick") {
            var $medInfo = $div.clone().prop('id', 'med-info-' + initNum + "-quick");
            $medInfo.find(":text, textarea").val('');
            $medInfo.find("[id^=med-name-]").attr("id", "med-name-" + initNum + "-quick");
            $medInfo.find("[for^=med-name-]").attr("for", "med-name-" + initNum + "-quick");
            $medInfo.find("[id^=med-strength-]").attr({
                "id": "med-strength-" + initNum + "-quick",
                "disabled": true
            });
            $medInfo.find("[for^=med-strength-]").attr("for", "med-strength-" + initNum + "-quick");
            $medInfo.find("[id^=med-dose-]").attr({
                "id": "med-dose-" + initNum + "-quick",
                "disabled": true
            });
            $medInfo.find("[for^=med-dose-]").attr("for", "med-dose-" + initNum + "-quick");
            $medInfo.find("[id^=med-route-]").attr({
                "id": "med-route-" + initNum + "-quick",
                "disabled": true
            });
            $medInfo.find("[for^=med-route-]").attr("for", "med-route-" + initNum + "-quick");
            $medInfo.find("[id^=med-timing-]").attr({
                "id": "med-timing-" + initNum + "-quick",
                "disabled": true
            });
            $medInfo.find("[for^=med-timing-]").attr("for", "med-timing-" + initNum + "-quick");
            $medInfo.find("[id^=med-selection-criteria-]").attr({
                "id": "med-selection-criteria-" + initNum + "-quick",
                "disabled": true
            });
            $medInfo.find("[id^=meds-radio-div-]").prop("id", "meds-radio-div-" + initNum);
            $medInfo.find("[name^='Meds Radio']").prop("name", "Meds Radio " + initNum);
            $medInfo.find("[for^=before-radio-]").prop("for", "before-radio-" + initNum);
            $medInfo.find("[id^=before-radio-]").prop({
                "id": "before-radio-" + initNum,
                "checked": false,
                "disabled": true
            });
            $medInfo.find("[for^=after-radio-]").prop("for", "after-radio-" + initNum);
            $medInfo.find("[id^=after-radio-]").prop({
                "id": "after-radio-" + initNum,
                "checked": false,
                "disabled": true
            });
            $medInfo.find("[for^=med-selection-criteria-]").attr("for", "med-selection-criteria-" + initNum + "-quick");

            var x = $allEntries.length;
            for (i = x; i > initNum; i--) {
                var $tempEntry = $('#' + $allEntries[i - 1].id).clone();
                $tempEntry.prop("id", "med-info-" + i + "-quick");
                $tempEntry.find("[id^=med-name-]").attr("id", "med-name-" + i + "-quick");
                $tempEntry.find("[for^=med-name-]").attr("for", "med-name-" + i + "-quick");
                $tempEntry.find("[id^=med-strength-]").attr("id", "med-strength-" + i + "-quick");
                $tempEntry.find("[for^=med-strength-]").attr("for", "med-strength-" + i + "-quick");
                $tempEntry.find("[id^=med-dose-]").attr("id", "med-dose-" + i + "-quick");
                $tempEntry.find("[for^=med-dose-]").attr("for", "med-dose-" + i + "-quick");
                $tempEntry.find("[id^=med-route-]").attr("id", "med-route-" + i + "-quick");
                $tempEntry.find("[for^=med-route-]").attr("for", "med-route-" + i + "-quick");
                $tempEntry.find("[id^=med-timing-]").attr("id", "med-timing-" + i + "-quick");
                $tempEntry.find("[for^=med-timing-]").attr("for", "med-timing-" + i + "-quick");
                $tempEntry.find("[id^=med-selection-criteria-]").attr("id", "med-selection-criteria-" + i + "-quick");
                $tempEntry.find("[for^=med-selection-criteria-]").attr("for", "med-selection-criteria-" + i + "-quick");
                $tempEntry.find("[id^=meds-radio-div-]").attr("id", "meds-radio-div-" + i);
                $tempEntry.find("[id^=before-radio-]").attr("id", "before-radio-" + i);
                $tempEntry.find("[for^=before-radio-]").attr("for", "before-radio-" + i);
                $tempEntry.find("[id^=after-radio-]").attr("id", "after-radio-" + i);
                $tempEntry.find("[for^=after-radio-]").attr("for", "after-radio-" + i);

                $('#' + $allEntries[i - 1].id).parent().find(".add-meds").before($tempEntry).html(); // Add entry to end of current section
                $('#' + $allEntries[i - 1].id).remove(); // Remove old one
            }
        }

        $(this).before($medInfo).html();
        $(this).parent().find(".remove-meds").attr("disabled", false);
    });

    $(".add-labs").click(function () {
        var $mostRecentLab = $(this).parent().find("[id^=lab-form-]:last");
        var $mostRecentFormID = $mostRecentLab.prop("id");
        mostRecentLabNum = parseInt($mostRecentLab.prop("id").match(/\d+/g), 10) + 1;
        var $newLab = $mostRecentLab.clone().prop('id', $mostRecentFormID.slice(0, $mostRecentFormID.length - 1) + mostRecentLabNum); //Clone and increment id
        var $labTypeID = $newLab.find("[id^=lab-type-]").prop("id");
        var $labResultID = $newLab.find("[id^=lab-result-]").prop("id");
        var $labStatementID = $newLab.find("[id^=lab-statement-]").prop("id");
        $newLab.find("input,textarea").val('');
        $newLab.find("[id^=lab-type-]").attr("id", $labTypeID.slice(0, $labTypeID.length - 1) + mostRecentLabNum);
        $newLab.find("[id^=lab-result-]").attr({
            "id": $labResultID.slice(0, $labResultID.length - 1) + mostRecentLabNum,
            "disabled": true
        });
        $newLab.find("[id^=lab-statement-]").prop({
            "id": $labStatementID.slice(0, $labStatementID.length - 1) + mostRecentLabNum,
            "disabled": true
        });
        $newLab.find("[for^=lab-type-]").attr("for", $labTypeID.slice(0, $labTypeID.length - 1) + mostRecentLabNum);
        $newLab.find("[for^=lab-result-]").attr("for", $labResultID.slice(0, $labResultID.length - 1) + mostRecentLabNum);
        $newLab.find("[for^=lab-statement-]").prop("for", $labStatementID.slice(0, $labStatementID.length - 1) + mostRecentLabNum);
        $(this).before($newLab).html();
        $(this).parent().find(".remove-labs").prop("disabled", false);
    });

    $(".remove-labs").click(function () {
        console.log("Lab removed")
        $(this).parent().find("[id^=lab-form-]:last").remove();
        mostRecentLabNum -= 1;
        if (mostRecentLabNum == 0) {
            $(this).attr("disabled", true);
        }
    });

    $(".add-lab-statements").click(function () {
        var $mostRecentLabStatement = $(this).parent().find('div[id^=lab-form-]:last');
        var $mostRecentIDSlice = $mostRecentLabStatement.prop("id").slice(0, $mostRecentLabStatement.prop("id").length - 1);
        mostRecentLabStatementNum = parseInt($mostRecentLabStatement.prop("id").match(/\d+/g), 10) + 1;
        var $newLabStatement = $mostRecentLabStatement.clone().prop('id', $mostRecentIDSlice + mostRecentLabStatementNum);
        var $typeIDSlice = $newLabStatement.find("[id^=lab-type-]").prop("id").slice(0, $newLabStatement.find("[id^=lab-type-]").prop("id").length - 1);
        var $resultIDSlice = $newLabStatement.find("[id^=lab-result-]").prop("id").slice(0, $newLabStatement.find("[id^=lab-result-]").prop("id").length - 1);
        var $statementIDSlice = $newLabStatement.find("[id^=lab-statement-]").prop("id").slice(0, $newLabStatement.find("[id^=lab-statement-]").prop("id").length - 1);
        $newLabStatement.find("[id^=lab-type-]").prop("id", $typeIDSlice + mostRecentLabStatementNum);
        $newLabStatement.find("[id^=lab-result-]").prop("id", $resultIDSlice + mostRecentLabStatementNum);
        $newLabStatement.find("[id^=lab-statement-]").prop("id", $statementIDSlice + mostRecentLabStatementNum);
        $(this).before($newLabStatement).html();
        $(".remove-labs").prop("disabled", false);
    });

    $(".remove-lab-statements").click(function () {
        $("#lab-statement-form-" + mostRecentLabStatementNum).remove();
        mostRecentLabStatementNum -= 1;
        if (mostRecentLabStatementNum == 0) {
            $(this).prop("disabled", true);
        }
    });

    $("#quick-modal-proceed").click(function () {
        $("#quick-modal").modal("hide"); // Hides modal when proceed is clicked
        request = $.post("script.php", { // Post input to php
            formData: $("#quick-modal-input").val() // formData is input
        }, function (response) { // Get back response
            $("#quick-modal-input").val(''); // Reset value of modal input
            console.log(response);
            //debugger;
            var jsonResponse = JSON.parse(response); // Parse response into array
            for (var key in jsonResponse) { // Go through each value and find where it belongs
                console.log("Key: " + key + ", Val: " + jsonResponse[key]);
                if (key == "Age") {
                    $("#quick-age").val(jsonResponse[key])
                } else if (key == "Sex") {
                    if (jsonResponse[key][0].toLowerCase() == 'm') {
                        $("#maleRadio").prop("checked", true);
                    } else if (jsonResponse[key][0].toLowerCase() == 'w' || jsonResponse[key][0].toLowerCase() == 'f') {
                        $("#femaleRadio").prop("checked", true);
                    } else {
                        $("#otherRadio").prop("checked", true);
                        $("#otherGender").prop("disabled", false);
                        $("#otherGender").val(jsonResponse[key]);
                    }
                } else if (key == "Labs") {
                    var labCount = 0;
                    console.log(jsonResponse["Labs"].length);
                    for (var lab in jsonResponse[key]) {
                        $("#lab-type-quick-" + labCount).val(jsonResponse[key][labCount]["Lab Name"]);
                        $("#lab-result-quick-" + labCount).val(jsonResponse[key][labCount]["Lab Value"] + ' ' + jsonResponse[key][labCount]["Lab Units"]);
                        $("#lab-result-quick-" + labCount).prop("disabled", false);
                        $("#lab-statement-quick-" + labCount).prop("disabled", false);
                        if (Object.keys(jsonResponse[key][labCount]).length == 4) {
                            $("#lab-statement-quick-" + labCount).val(jsonResponse[key][labCount]["Lab Statement"]);
                        }
                        $("#quick-add-labs").click();
                        labCount += 1;
                    }
                    $("#quick-remove-labs").click();
                } else if (key == "Meds") {

                    for (var med in jsonResponse[key]) {
                        var ba = jsonResponse[key][med]["Before / After"];

                        var ba_kws = ["before", "b"];
                        $("#med-name-" + med + "-quick").val(jsonResponse[key][med]["Medication Name"]);
                        $("#med-strength-" + med + "-quick").val(jsonResponse[key][med]["Medication Strength"]);
                        $("#med-dose-" + med + "-quick").val(jsonResponse[key][med]["Medication Dose"]);
                        $("#med-route-" + med + "-quick").val(jsonResponse[key][med]["Medication Route"]);
                        $("#med-timing-" + med + "-quick").val(jsonResponse[key][med]["Medication Timing/Frequency"]);
                        $("#med-selection-criteria-" + med + "-quick").val(jsonResponse[key][med]["Selection Criteria"]);

                        $("#med-strength-" + med + "-quick").prop("disabled", false);
                        $("#med-dose-" + med + "-quick").prop("disabled", false);
                        $("#med-route-" + med + "-quick").prop("disabled", false);
                        $("#med-timing-" + med + "-quick").prop("disabled", false);
                        $("#med-selection-criteria-" + med + "-quick").prop("disabled", false);

                        if (ba_kws.indexOf(ba.toLowerCase()) != -1) { // check if the before keyword is present
                            $("#before-radio-" + med).prop({
                                "checked": true,
                                "disabled": false
                            });
                            $("#after-radio-" + med).prop("disabled", false);

                        } else {
                            $("#after-radio-" + med).prop({
                                "checked": true,
                                "disabled": false
                            });
                            $("#before-radio-" + med).prop("disabled", false);
                        }
                        $("#add-meds-quick").click();
                    }
                    $("#remove-meds-quick").click();
                } else if (key == "Ethnicity") {

                    $("#quick-race").val(jsonResponse[key]);

                } else if (key == "Chief Complaint") {

                    $("#quick-chief-complaint").val(jsonResponse[key]);

                } else if (key == "Family History") {

                    $("#quick-family").val(jsonResponse[key]);

                } else if (key == "HPI") {

                    $("#quick-hpi").val(jsonResponse[key]);

                } else if (key == "PMH") {

                    $("#quick-pmh").val(jsonResponse[key]);

                } else if (key == "Physical Info") {

                    $("#quick-physical").val(jsonResponse[key]);

                } else if (key == "Role") {

                    $("#quick-role").val(jsonResponse[key]);

                } else if (key == "Self Health") {

                    $("#quick-self-health").val(jsonResponse[key]);

                } else if (key == "Social History") {

                    $("#quick-social").val(jsonResponse[key]);

                } else if (key == "Working With") {

                    $("#quick-working-with").val(jsonResponse[key]);

                } else if (key == "Task") {

                    $("#quick-task").val(jsonResponse[key]);

                } else {

                    $("#quick-container [name='" + key + "']").val(jsonResponse[key]);

                }



            }
            $("#preview").html(makeQuickString(JSON.parse(response))); // Construct preview
        });
        request.done(function (response, textStatus, jqXHR) {
            // Log a message to the console
            console.log("All Good.");
        });

        // Callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown) {
            // Log the error to the console
            console.error(
                "The following error occurred: " +
                textStatus, errorThrown
            );
        });
    });
    $("#quick-modal-input").val("'t':'task' white 'med':'st':'dose':'route':'timing':'selection':'b' 'med2':'st2':'dose2':'route2':'timing2':'selection2':'a' 21 'transgender male' 'lab':'val':'unit' 'c':'cc' 'f':'fh' 'h':'hpi' 'pm':'pmh' 'pi':'phys info' 'r':'role' 'sh':'self health' 's':'social history' 'w':'working with'"); // Debugging
    $("#quick-modal-proceed").prop("disabled", false); // Debugging
    $("#quick-modal-proceed").click(); // Debugging
    $("#quick-tab").click(); // Debugging

});


function downloadCustom() {
    var _arr = $("form").serializeArray();
    var _text = makeCustomString();
    var element = document.createElement('a');
    var filename = $("#name").val() + '_' + $("#age").val();
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(_text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
    return false;
}

function makeCustomString() { // Makes preview string from inputs using helper functions
    setPatientName();
    var fullStatement = '';
    var demographics = cleanCustomDemographics($("#demographics input").serializeArray());
    var context = cleanCustomContext($("#context input").serializeArray());
    var history = cleanCustomHistory($("#history textarea").serializeArray());
    var medicationsOnPresentation = cleanCustomMeds($("#meds-on-presentation .med-inputs").serializeArray());
    var medsChanged = cleanCustomMeds($("#meds-changed .med-inputs").serializeArray());
    var medsAfter = cleanCustomMeds($("#meds-after .med-inputs").serializeArray());
    var providerInfo = cleanCustomProviderInfo($("#provider-info > textarea").serializeArray());
    var labInfo = cleanCustomLabInfo($("#provider-info .labs").serializeArray());
    var patientStatus = cleanCustomPatientStatus($("#patient-status").val());
    var socialContext = cleanCustomSocialContext($("#social-context textarea").serializeArray());
    var healthcareTeam = cleanCustomHealthcareTeam($("#healthcare-team input, #healthcare-team textarea").serializeArray());
    var patientBehaviors = cleanCustomPatientBehaviors($("#patient-behaviors textarea").serializeArray());
    var caseAssignment = cleanCustomCaseAssignment($("#case-assignment textarea").serializeArray());
    return demographics + context + history + medicationsOnPresentation + medsChanged + medsAfter + providerInfo + labInfo + patientStatus + socialContext + healthcareTeam + patientBehaviors + caseAssignment;
}

function makeQuickString(_arr) { // Makes preview string from quick input
    var demographics = cleanQuickDemographics($("#quick-demographics input").serializeArray());
    var context = cleanQuickContext($("#quick-context textarea").serializeArray());
    var history = cleanQuickHistory($("#quick-history textarea").serializeArray());
    var medications = cleanQuickMeds($("#meds-quick .med-inputs").serializeArray());
    var providerInfo = cleanQuickProviderInfo($("#provider-info-quick > textarea").serializeArray());
    var labInfo = cleanQuickLabInfo($("#provider-info-quick .labs").serializeArray());
    var healthcareTeam = cleanQuickHealthcareTeam($("#quick-healthcare-team input, #quick-healthcare-team textarea").serializeArray());
    var patientBehaviors = cleanQuickSelfHealth($("#quick-self-health").val());
    var caseAssignment = cleanQuickTask($("#quick-task").val());
    return demographics + context + history + medications;
}

function cleanQuickDemographics(_formInput) {
    var formInput = [];
    for (var key in _formInput) {
        if (_formInput[key]["value"]) formInput.push(_formInput[key]); // Check if input has a value
    }
    if (formInput.length == 3) { // Then construct the appropriate string base don the populated values.
        return "Your patient is a " + formInput[1]["value"] + " year-old " + formInput[2]["value"] + " " + formInput[0]["value"] + ".\r\n";
    }
    if (formInput.length == 2) {
        if (formInput[0]["name"] == "Gender" || formInput["name"] == "inlineRadioOptions") {
            if (formInput[1]["name"] == "Age") {
                return "Your patient is a " + formInput[1]["value"] + " year old " + formInput[0]["value"] + ".\r\n";
            } else {
                return "Your patient is a " + formInput[1]["value"] + " " + formInput[0]["value"] + ".\r\n";
            }
        } else {
            return "Your patient is " + formInput[0]["value"] + " years old and " + formInput[1]["value"] + ".\r\n";
        }
    }
    if (formInput[0]["name"] == "inlineRadioOptions" || formInput[0]["name"] == "Gender") {
        return "Your patient is a " + formInput[0]["value"] + ".\r\n";
    } else if (formInput[0]["name"] == "Age") {
        return "Your patient is " + formInput[0]["value"] + " years old.\r\n";
    } else {
        return "Your patient is " + formInput[0]["value"] + ".\r\n";
    }
}

function cleanQuickContext(_formInput) {
    return _formInput[0]["value"] + " " + _formInput[0]["value"];
}

function cleanQuickHistory(_formInput) {
    return _formInput[0]["value"] + "\r\n" + _formInput[1]["value"] + "\r\n" + _formInput[2]["value"] + "\r\n";
}

function cleanQuickMeds(_formInput) {
    var formInput = [];
    var mapHolder = new Map();
    var medCount = 0;
    for (var parameter in _formInput) { // Separates meds into their own array elements
        if (parameter != 0 && _formInput[parameter]["name"] == "Medication Name") {
            for (var i = medCount; i < parameter; i++) {
                mapHolder.set(_formInput[i]["name"], _formInput[i]["value"]); // Put all parameters for each medication in their own map.
            }
            formInput.push(mapHolder); // Then add it to formInput
            medCount = parameter;
        }
    }

    mapHolder.clear();

    for (var i = medCount; i < _formInput.length; i++) { // add the final medication to formInput.
        mapHolder.set(_formInput[i]["name"], _formInput[i]["value"]);
    }

    formInput.push(mapHolder);

    for (var med in formInput) {
        debugger;
        console.log(formInput[med].get("Medication Strength"));
        if (formInput[med].size == 7) {
            debugger;
            return "Patient " + (formInput[med].get("Meds Radio " + med.toString()) == "Before" ? "was" : "is now") + " on " + formInput[med].get("Medication Name") + " " + formInput[med].get("Medication Strength") + " taking " + formInput[med].get("Medication Dose") + " " + formInput[med].get("Medication Route") + " " + formInput[med].get("Medication Timing/Frequency") + ". " + formInput[med].get("Selection Criteria");
        }
        if (formInput.length == 6) {

        }
        if (formInput.length == 5) {

        }
        if (formInput.length == 4) {

        }
        if (formInput.length == 3) {

        }
        if (formInput.length == 2) {

        }
    }
}

function cleanQuickProviderInfo(_formInput) {

}

function cleanQuickLabInfo(_formInput) {

}

function cleanQuickHealthcareTeam(_formInput) {

}

function cleanQuickSelfHealth(_formInput) {

}

function cleanQuickTask(_formInput) {

}

function cleanCustomDemographics(_formInput) {
    var formInput = _formInput.filter(item => item["value"]);
    if (formInput.length == 0) {
        return '';
    }
    var firstVal = formInput[0]["value"];
    var firstName = formInput[0]["name"];
    if (formInput.length == 1) {
        if (firstName == "name") {
            return "Your patient's name is " + firstVal + ".\r\n\r\n";
        } else if (firstName == "age") {
            return "Your patient is " + firstVal + " years-old.\r\n\r\n";
        } else if (firstName == "ethnicity") {
            return "Your patient is " + firstVal + ".\r\n\r\n";
        } else {
            return "Your patient is a " + firstVal + '.\r\n\r\n';
        }
    }
    var secondVal = formInput[1]["value"];
    var secondName = formInput[1]["name"];
    if (formInput.length == 2) {
        if (firstName == "name") {
            if (secondName == "age") {
                return firstVal + " is " + secondVal + " years-old.\r\n\r\n";
            } else if (secondName == "ethnicity") {
                return firstVal + " is " + secondVal + ".\r\n\r\n"
            } else {
                return firstVal + " is a " + secondVal + ".\r\n\r\n"
            }
        } else if (firstName == "age") {
            if (secondName == "ethnicity") {
                return "Your patient is " + firstVal + " years old and " + secondVal + ".\r\n\r\n";
            } else {
                return "Your patient is a " + firstVal + " year-old " + secondVal + ".\r\n\r\n";
            }
        } else {
            return "Your patient is a " + firstVal + ' ' + secondVal + ".\r\n\r\n";
        }
    }
    var thirdVal = formInput[2]["value"];
    var thirdName = formInput[2]["name"];
    if (formInput.length == 3) {
        if (firstName == "name") {
            if (secondName == "age") {
                if (thirdName == "ethnicity") {
                    return firstVal + " is " + secondVal + " years old and " + thirdVal + ".\r\n\r\n";
                } else {
                    return firstVal + " is a " + secondVal + " year-old " + thirdVal + ".\r\n\r\n";
                }
            } else { // Means vals are Name, Ethnicity, and Gender
                return firstVal + " is a " + secondVal + " " + thirdVal + ".\r\n\r\n";
            }
        } else if (firstName == "age") { // Means vals are Age Ethnicity and Gender
            return "Your patient is a " + firstVal + " year-old " + secondVal + ' ' + thirdVal + ".\r\n\r\n";
        }
    } else {
        return firstVal + " is a " + secondVal + " year-old " + thirdVal + " " + formInput[3]["value"] + ".\r\n\r\n";
    }
}

function cleanCustomContext(_formInput) {
    var hpi = '';
    if ($("#hpi").val()) {
        hpi = "\r\nHPI: \r\n" + $("#hpi").val();
    }
    var formInput = _formInput.filter(item => {
        return item["value"];
    });
    if (formInput.length == 0) {
        return hpi + "\r\n\r\n";
    }
    var firstVal = formInput[0]["value"];
    var firstName = formInput[0]["name"];
    if (formInput.length == 1) {
        if (firstName == "patient-movement") {
            return hpi + "\r\n\r\n"; // TODO figure out
        } else if (firstName == "setting") {
            return patientName + " presents at " + firstVal + '.' + hpi + "\r\n\r\n";
        } else {
            return patientName + " complains of " + firstVal + '.' + hpi + "\r\n\r\n";
        }
    }
    var secondVal = formInput[1]["value"];
    var secondName = formInput[1]["name"];
    if (formInput.length == 2) {
        if (firstName == "patient-movement") {
            if (secondName == "setting") {
                return patientName + ' ' + firstVal + ' ' + secondVal + '.' + hpi + "\r\n\r\n";
            } else { // PM and CC
                return patientName + " presents complaining of " + secondVal + '.' + hpi + "\r\n\r\n";
            }
        } else { // Setting and Chief Complaint
            return patientName + " presents at " + firstVal + " complaining of " + secondVal + '.' + hpi + "\r\n\r\n";
        }
    } else {
        return patientName + ' ' + firstVal + ' ' + secondVal + " complaining of " + formInput[2]["value"] + '.' + hpi + "\r\n\r\n";
    }
}

function cleanCustomHistory(_formInput) {
    var formInput = _formInput.filter(item => item["value"]);
    var history = '';
    formInput.forEach(item => {
        var firstVal = item["value"];
        if (item["name"] == "immunizations") {
            history += "Immunizations include " + firstVal + ".\r\n\r\n";
        } else if (item["name"] == "allergies") {
            history += patientName + " is allergic to " + firstVal + ".\r\n\r\n";
        } else {
            history += firstVal + "\r\n\r\n";
        }
    });
    return history;
}

function cleanCustomMeds(_formInput) {
    var formInput = _formInput.filter(item => item["value"]); // Removes empty elements
    var meds = '';
    var medList = [];
    var medData = [];
    if (formInput.length == 0) {
        return '';
    }
    while (formInput.length > 0) {
        if (formInput[0]["name"] == "Medication Name") { // Add previous data as a list to medList when we get to a value named "Medication Name".
            medList.push(medData);
            medData = []; // Then clear medData.
        }
        medData.push(formInput[0]);
        formInput.shift();
    }
    medList.push(medData);
    medList.forEach(medListData => {
        medListData.forEach(medItem => {
            meds += medItem["name"] + ": " + medItem["value"] + "\r\n";
        });
        meds += "\r\n\r\n";
    });
    return meds + "__\r\n\r\n";
}

function cleanCustomProviderInfo(_formInput) {
    var formInput = _formInput.filter(item => item["value"]);
    var providerInfo = '';
    formInput.forEach(item => {
        providerInfo += item["name"] + ":\r\n" + item["value"] + "\r\n\r\n";
    })
    return providerInfo + "\r\n\r\n";
}

function cleanCustomLabInfo(_formInput) {
    var formInput = _formInput.filter(item => item["value"]);
    var labInfo = '';
    formInput.forEach(item => {
        if (item["name"] == "Type/Name of Lab") {
            labInfo += "\r\n";
        }
        labInfo += item["name"] + ": " + item["value"] + "\r\n";
    });
    return labInfo + "\r\n\r\n";
}

function cleanCustomPatientStatus(_formInput) {
    if (_formInput) {
        return "Patient Status: \r\n" + _formInput + "\r\n\r\n";
    } else {
        return '';
    }
}

function cleanCustomSocialContext(_formInput) {
    var formInput = _formInput.filter(item => item["value"]);
    var socialContext = '';
    formInput.forEach(item => {
        socialContext += item["name"] + ":\r\n" + item["value"] + "\r\n";
    });
    return socialContext + "\r\n\r\n";
}

function cleanCustomHealthcareTeam(_formInput) {
    var formInput = _formInput.filter(item => item["value"]);
    var healthcareTeam = '';
    formInput.forEach(item => {
        healthcareTeam += item["name"] + ":\r\n" + item["value"] + "\r\n\r\n";
    });
    return healthcareTeam + "\r\n\r\n";

}

function cleanCustomPatientBehaviors(_formInput) {
    var formInput = _formInput.filter(item => item["value"]);
    var patientBehavior = '';
    formInput.forEach(item => {
        patientBehavior += item["name"] + ":\r\n" + item["value"] + "\r\n\r\n";
    })
    return patientBehavior + "\r\n\r\n";
}

function cleanCustomCaseAssignment(_formInput) {
    var formInput = _formInput.filter(item => item["value"]);
    var caseAssignment = '';
    formInput.forEach(item => {
        caseAssignment += item["name"] + ":\r\n" + item["value"] + "\r\n\r\n";
    })
    return caseAssignment;
}

function setPatientName() {
    if ($("#name").val()) {
        patientName = $("#name").val();
    } else {
        patientName = "Patient";
    }
    return
}

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
