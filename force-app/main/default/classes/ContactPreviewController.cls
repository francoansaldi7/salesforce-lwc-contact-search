/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 01-20-2026
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/

/**
 * This controller is used to fetch a **single Contact record**
 * with basic information to be displayed in a preview component
 * (you'll get a list of contacts from the Contact Search component, and by clicking on one of them, you can preview the contact's info on the Contact Preview Component).
 *
 * - It is marked as `with sharing` to respect Salesforce sharing rules.
 * - The method is `@AuraEnabled(cacheable=true)` so it can be called
 *   from LWC or Aura and benefit from client-side caching.
 */
public with sharing class ContactPreviewController {

    @AuraEnabled(cacheable=true)
    public static Contact getContactPreview(Id contactId) {

        if (contactId == null) {
            throw new AuraHandledException('Contact Id is required.');
        }

        try {
            return [
                SELECT Id, Name, Email, Phone, Title, Account.Name
                FROM Contact
                WHERE Id = :contactId
                LIMIT 1
            ];
        } catch (Exception e) {
            // Log for debugging
            System.debug('Error fetching Contact preview: ' + e.getMessage());

            throw new AuraHandledException(
                'Unable to load contact preview. Please try again later.'
            );
        }
    }
}
