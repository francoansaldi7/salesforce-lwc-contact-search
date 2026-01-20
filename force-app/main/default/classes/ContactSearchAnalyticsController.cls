/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 01-20-2026
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/

/**
 * This controller is responsible for **saving analytics data**
 * related to Contact search behavior.
 *
 * It is typically called from the frontend after a search action
 * to track usage and errors.
 *
 * Example use cases:
 * - How many searches were performed
 * - What was the last search term
 * - How long the session lasted
 * - Whether an error occurred
 */

/**
    * Saves search analytics into the custom object Contact_Search_Analytics__c.
    *
    * @param searchCount      - Number of searches performed in the session
    * @param lastSearchTerm   - The most recent search term entered by the user
    * @param sessionDuration - Duration of the session (in seconds or ms)
    * @param hasError         - Indicates if an error occurred
    * @param errorMessage     - Error details (if any)
    *
    * This method:
  * 1. Creates a new analytics record.
  * 2. Maps the incoming parameters to custom fields.
  * 3. Inserts the record into Salesforce for reporting.
 */

public with sharing class ContactSearchAnalyticsController {

    @AuraEnabled
    public static void saveAnalytics(
        Integer searchCount,
        String lastSearchTerm,
        Integer sessionDuration,
        Boolean hasError,
        String errorMessage
    ) {
        try {
            Contact_Search_Analytics__c record =
                new Contact_Search_Analytics__c(
                    Search_Count__c = searchCount,
                    Last_Search_Term__c = lastSearchTerm,
                    Session_Duration__c = sessionDuration,
                    Has_Error__c = hasError,
                    Error_Message__c = errorMessage
                );

            insert record;
        } catch (DmlException e) {
            // Log but DO NOT throw — analytics must not break UX
            System.debug(
                'Failed to save Contact Search Analytics: ' + e.getMessage()
            );
        }
    }
}
