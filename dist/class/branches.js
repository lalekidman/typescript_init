"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const branches_1 = require("../models/branches");
const app_error_1 = require("../utils/app-error");
const queries_1 = require("../utils/queries");
const uuid = require("uuid/v4");
const constants_1 = require("../utils/constants");
const RC = require("../utils/response-codes");
const partner_1 = require("./partner");
const account_1 = require("./account");
const settings_1 = require("./settings");
const helper_1 = require("../utils/helper");
const queue_settings_1 = require("../models/queue-settings");
const filePath = 'avatars/branches/';
class BusinessBranches extends queries_1.default {
    constructor() {
        super(branches_1.default);
        /**
         * form data that validates the submitted data.
         */
        this.formDataValidation = (data) => {
            const { name, branchName, email, address, contacts = [], about } = data;
            return helper_1.formDataValidator([
                {
                    fieldName: 'name',
                    type: constants_1.FORM_DATA_TYPES.STRING,
                    value: name
                },
                {
                    fieldName: 'email',
                    type: constants_1.FORM_DATA_TYPES.STRING,
                    value: email
                },
                {
                    fieldName: 'branchName',
                    type: constants_1.FORM_DATA_TYPES.STRING,
                    value: branchName
                },
                {
                    fieldName: 'about',
                    type: constants_1.FORM_DATA_TYPES.STRING,
                    value: about
                },
                {
                    fieldName: 'contacts',
                    type: constants_1.FORM_DATA_TYPES.ARRAY,
                    value: contacts
                },
                {
                    fieldName: 'address',
                    type: constants_1.FORM_DATA_TYPES.ANY,
                    value: address
                },
            ]);
        };
    }
    /**
     * add new branch
     * @param partnerId
     * @param data
     */
    //@ts-ignore
    save(partnerId, data) {
        return this.formDataValidation(data)
            .then(() => {
            const { contacts = [], email, address, avatar, coordinates, about } = data;
            return branches_1.default.find({
                email
            })
                .sort({
                createdAt: -1
            })
                .then(branch => {
                if (!branch.length) {
                    return new partner_1.default().findOne(partnerId)
                        .catch((err) => {
                        console.log('Fetch partner detais failed. Error: ', err.message);
                        throw new Error('No partner found.');
                    });
                }
                else {
                    throw new app_error_1.default(RC.EMAIL_ALREADY_EXISTS, 'email you input is already exists to our database.');
                }
            }).then((partner) => __awaiter(this, void 0, void 0, function* () {
                const primaryContactIndex = contacts.findIndex((prop) => (prop.isPrimary));
                const newBranch = this.initilize(Object.assign(data, {
                    email,
                    address,
                    partnerId,
                    about,
                    contacts: contacts.map((contact) => (Object.assign(contact, { _id: uuid() }))),
                    contactNo: contacts[primaryContactIndex].number,
                    location: {
                        coordinates: coordinates
                    }
                }));
                console.log(newBranch);
                const branchSettings = JSON.parse(JSON.stringify((yield new settings_1.default(newBranch._id).save(data))));
                const uploader = yield this.upload(filePath.concat(newBranch._id), avatar);
                const adminAccount = yield new account_1.default().addAccount(newBranch._id, {
                    firstName: 'Super Admin',
                    lastName: 'Admin',
                    roleLevel: constants_1.ACCOUNT_ROLE_LEVEL.SUPER_ADMIN,
                    partnerId: partnerId.toString(),
                    email: email.toString(),
                    contactNo: contacts[primaryContactIndex].number
                });
                uploader.imageUrl ? newBranch.avatarUrl = uploader.imageUrl : '';
                newBranch.save();
                console.log('rr: ', newBranch);
                // create branch queue settings
                const branchQueueSettings = new queue_settings_1.default();
                const queueSettingsId = uuid();
                branchQueueSettings.branchId = newBranch._id;
                branchQueueSettings._id = queueSettingsId;
                branchQueueSettings.id = queueSettingsId;
                branchQueueSettings.save();
                return Object.assign({}, JSON.parse(JSON.stringify(newBranch)), { settings: branchSettings });
            }));
            // }).then(async () => {
            // return Promise.resolve(DefaultQueueGroups.map((qg: any) => this.QG.save(Object.assign(Object.assign(qg, {businessBranchId: newBranch._id, businessUserId: newBranch._id})))))
            // }).then((queueGroups) => {
            //   return Object.assign(newBranch, {queueGroups})
        });
    }
}
exports.default = BusinessBranches;
