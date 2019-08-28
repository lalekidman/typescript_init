"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queries_1 = require("../utils/queries");
const settings_1 = require("../models/settings");
const constants_1 = require("../utils/constants");
const helper_1 = require("../utils/helper");
const uuid = require("uuid/v4");
const DefaultOperationHours = [
    {
        startValue: 3600000,
        endValue: 36000000,
        enabled: true,
        day: 0,
        isWholeDay: false,
    },
    {
        startValue: 3600000,
        endValue: 36000000,
        enabled: true,
        day: 1,
        isWholeDay: false,
    },
    {
        startValue: 3600000,
        endValue: 36000000,
        enabled: true,
        day: 2,
        isWholeDay: false,
    },
    {
        startValue: 3600000,
        endValue: 36000000,
        enabled: true,
        day: 3,
        isWholeDay: false,
    },
    {
        startValue: 3600000,
        endValue: 36000000,
        enabled: true,
        day: 4,
        isWholeDay: false,
    },
    {
        startValue: 3600000,
        endValue: 36000000,
        enabled: false,
        day: 5,
        isWholeDay: true,
    },
    {
        startValue: 3600000,
        endValue: 36000000,
        enabled: true,
        day: 6,
        isWholeDay: false,
    }
];
class BranchSettings extends queries_1.default {
    constructor(branchId) {
        super(settings_1.default);
        this.formDataValidator = (data) => {
            const { branchId, operationHours = [], modules = [], socialLinks = [] } = data;
            return helper_1.formDataValidator([
                {
                    fieldName: 'branchId',
                    type: constants_1.FORM_DATA_TYPES.STRING,
                    value: branchId
                },
                {
                    fieldName: 'modules',
                    type: constants_1.FORM_DATA_TYPES.ARRAY,
                    value: modules
                },
                {
                    fieldName: 'operationHours',
                    type: constants_1.FORM_DATA_TYPES.ARRAY,
                    value: operationHours
                },
                {
                    fieldName: 'socialLinks',
                    type: constants_1.FORM_DATA_TYPES.ARRAY,
                    value: socialLinks
                },
            ]);
        };
        if (!branchId) {
            throw new Error('branchId is required to initiate the branch settings');
        }
        this.branchId = branchId;
    }
    /**
     * save the settings of the branch
     * @param branchId
     * @param data
     */
    //@ts-ignore
    save(data) {
        return this.formDataValidator(data)
            .then(() => {
            const { modules = [constants_1.BRANCH_MODULES.QUEUE, constants_1.BRANCH_MODULES.RESERVATION], operationHours = [], socialLinks = [] } = data;
            const opHours = (operationHours.length === 0 || operationHours.length <= 6) ? DefaultOperationHours : operationHours;
            const newBranchSetting = this.initilize(Object.assign({}, data, { branchId: this.branchId.toString().trim(), modules, operationHours: opHours.map((oph) => (Object.assign(oph, { _id: uuid() }))), socialLinks: socialLinks.map((social) => Object.assign(social, !social.id ? { id: uuid() } : {})) }));
            return newBranchSetting.save();
        });
    }
    /**
     * update total queue group created
     * @param branchId
     */
    updateQueueGroupCounter() {
        return settings_1.default
            .findOneAndUpdate({
            branchId: this.branchId
        }, {
            $inc: {
                totalQueueGroup: 1
            }
        }, {
            new: true
        })
            .then((setting) => {
            if (!setting) {
                throw new Error('No branch data found.');
            }
            return setting;
        });
    }
}
exports.default = BranchSettings;
