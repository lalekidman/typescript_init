"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queries_1 = require("../utils/queries");
const settings_1 = require("../models/settings");
const constants_1 = require("../utils/constants");
const helper_1 = require("../utils/helper");
const uuid = require("uuid/v4");
const DefaultOperationHours = [
    {
        openingTime: 3600000,
        closingTime: 36000000,
        enabled: true,
        day: 0,
        isWholeDay: false,
    },
    {
        openingTime: 3600000,
        closingTime: 36000000,
        enabled: true,
        day: 1,
        isWholeDay: false,
    },
    {
        openingTime: 3600000,
        closingTime: 36000000,
        enabled: true,
        day: 2,
        isWholeDay: false,
    },
    {
        openingTime: 3600000,
        closingTime: 36000000,
        enabled: true,
        day: 3,
        isWholeDay: false,
    },
    {
        openingTime: 3600000,
        closingTime: 36000000,
        enabled: true,
        day: 4,
        isWholeDay: false,
    },
    {
        openingTime: 3600000,
        closingTime: 36000000,
        enabled: true,
        day: 5,
        isWholeDay: false,
    },
    {
        openingTime: 3600000,
        closingTime: 36000000,
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
            const newBranchSetting = this.initilize(Object.assign(Object.assign({}, data), { branchId: this.branchId.toString().trim(), modules, operationHours: opHours.map((oph) => (Object.assign(oph, { _id: uuid() }))), socialLinks: socialLinks.map((social) => Object.assign(social, !social.id ? { id: uuid() } : {})) }));
            return newBranchSetting.save();
        });
    }
    findOne(query, project = {}) {
        return settings_1.default
            .findOne(query, project);
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
    /**
     * update operationHours
     * @param branchId
     */
    updateOperationHours({ isWeeklyOpened = false, operationHours = [] }) {
        return this.findOne({
            branchId: this.branchId
        })
            .then((branchSettings) => {
            if (!branchSettings) {
                throw new Error('No branch settings found.');
            }
            if (isWeeklyOpened) {
                return branchSettings
                    .set({ isWeeklyOpened: true })
                    .save();
            }
            const opHours = ((operationHours.length === 0 || operationHours.length <= 6) ? DefaultOperationHours : operationHours)
                .map((oph, index) => {
                if (!oph._id) {
                    oph._id = uuid();
                }
                return {
                    _id: oph._id,
                    openingTime: parseInt(oph.openingTime),
                    closingTime: parseInt(oph.closingTime),
                    day: parseInt(oph.day) <= 6 && parseInt(oph.day) >= 0 ? parseInt(oph.day) : index,
                    isWholeDay: typeof (oph.isWholeDay) === 'boolean' ? oph.isWholeDay : false,
                    enabled: typeof (oph.enabled) === 'boolean' ? oph.enabled : false,
                };
            });
            return branchSettings.set({
                isWeeklyOpened: false,
                operationHours: opHours
            })
                .save();
        });
    }
    /**
     *
     * @param location array of number/float
     *  first element should be the long and the second one is for lat
     */
    updateGeoLocation(location) {
        return this.findOne({
            branchId: this.branchId
        })
            .then((branchSettings) => {
            if (!branchSettings) {
                throw new Error('No branch settings found.');
            }
            if (location.length <= 1) {
                throw new Error('Location must be array with a 2 element, 0 is for long and 1 is for lng.');
            }
            return branchSettings.set({
                'location.coordinates': location.splice(0, 2)
            })
                .save();
        });
    }
}
exports.default = BranchSettings;
