# GlideRecordUtils
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![license-shield]][license-url]

Base script include containing general utilities for GlideRecord objects. Is should be extended by any script include representing a database database table such as Incident, or User

Features included:

- Instantiate a record by sys_id, object, number or other attribute representing it (such as user_name for sys_user table) -- New attributes can be included to a system property
- Throw an error in a structured way -- includes logging system using GSLog tool
- Retrieve the choice options for a given attribute of type choice
- Check whether a choice value is valid for a choice field taking into account potential dependent attributes
- Retrieve the hierarchy for the instantiated table within an array

# Installation

- Option 1. Committing [update set](./releases/GlideRecorDUtils_100.xml)

## Technical solution

### Script includes

- `GlideRecordUtils()`: Contains the logic of the utility.

### System properties

| Property name | Description |
| ------------- | ----------- |
| `	gliderecordutils.keys` | PK attributes used by the script to find the records in the database |

### UI Messages

- `gliderecord_utils.error.choice_field.invalid_value`: Error message displayed when a value is not valid for a choice field
- `gliderecord_utils.error.choice_field.invalid_value.dependent`: Error message displayed when a value is not valid for a choice field due to the dependent field
- `gliderecord_utils.error.record_not_found`: Error message displayed when the record could not be found
- `gliderecord_utils.error.record_not_found.any`: Error message displayed when the record could not be found through out any determination method
- `gliderecord_utils.error.record_not_found.gliderecord`: Error message displayed when the record could not be found as a GlideRecord
- `gliderecord_utils.error.record_not_found.number`: rror message displayed when the record could not be found by number
- `gliderecord_utils.error.record_not_found.sys_id`: Error message displayed when the record could not be found by sys_id
- `gliderecord_utils.error.table_name_undefined`: ErError message displayed when the table could not be found


[contributors-shield]: https://img.shields.io/github/contributors/AlexAlvarez092/SN-GlideRecordUtils.svg?style=for-the-badge
[contributors-url]: https://github.com/AlexAlvarez092/SN-GlideRecordUtils/graphs/contributors

[forks-shield]: https://img.shields.io/github/forks/AlexAlvarez092/SN-GlideRecordUtils.svg?style=for-the-badge
[forks-url]: https://github.com/AlexAlvarez092/SN-GlideRecordUtils/network/members

[stars-shield]: https://img.shields.io/github/stars/AlexAlvarez092/SN-GlideRecordUtils.svg?style=for-the-badge
[stars-url]: https://github.com/gAlexAlvarez092/SN-GlideRecordUtils/stargazers

[issues-shield]: https://img.shields.io/github/issues/AlexAlvarez092/SN-GlideRecordUtils.svg?style=for-the-badge
[issues-url]: https://github.com/AlexAlvarez092/SN-GlideRecordUtils/issues

[license-shield]: https://img.shields.io/github/license/AlexAlvarez092/SN-GlideRecordUtils.svg?style=for-the-badge
[license-url]: https://github.com/AlexAlvarez092/SN-GlideRecordUtils/blob/master/LICENSE.txt