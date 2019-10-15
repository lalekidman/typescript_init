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
const industry_1 = require("../models/industry");
const partners_1 = require("../models/partners");
const queries_1 = require("../utils/queries");
const uuid = require("uuid/v4");
const helper_1 = require("../utils/helper");
const constants_1 = require("../utils/constants");
const filePath = 'avatars/industry/';
class Industries extends queries_1.default {
    // private ALM: ActivityLogs
    constructor() {
        super(industry_1.default);
        this.BPM = new queries_1.default(partners_1.default);
        // this.ALM = new ActivityLogs('industries')
    }
    formDataValidator(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name = '', shortName = '', icon = '', category = '', categoryList = [] } = data;
            return helper_1.formDataValidator([
                {
                    type: constants_1.FORM_DATA_TYPES.STRING,
                    value: name,
                    fieldName: 'name'
                },
                {
                    type: constants_1.FORM_DATA_TYPES.STRING,
                    value: shortName,
                    fieldName: 'shortName'
                },
                {
                    type: constants_1.FORM_DATA_TYPES.STRING,
                    value: category,
                    fieldName: 'category'
                },
                {
                    type: constants_1.FORM_DATA_TYPES.ARRAY,
                    value: categoryList,
                    fieldName: 'categoryList'
                }
            ]);
        });
    }
    /**
     * add new category
     * @param data
     */
    save(data) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            const { name = '', shortName = '', icon, category = '', categoryList = [] } = data;
            return this.formDataValidator(data)
                .then(() => {
                const newIndustry = _super("initilize").call(this, { name, shortName, category, categoryList: this.generateCategoryList(categoryList) });
                return _super("upload").call(this, filePath.concat(newIndustry._id), icon)
                    .then(({ imageUrl }) => {
                    newIndustry.iconUrl = imageUrl;
                    return newIndustry.save();
                });
            });
        });
    }
    /**
     * update category
     * @param industryId
     * @param data
     */
    updateOne(industryId, data) {
        const { name, shortName, icon, category, categoryList } = data;
        return this.formDataValidator(data)
            .then(() => {
            return super.findOne({ _id: industryId }).then((industry) => {
                industry.set({ name, shortName, category, categoryList: this.generateCategoryList(categoryList) });
                return super.upload(filePath.concat(industry._id), icon).then(({ imageUrl }) => {
                    imageUrl ? industry.iconUrl = imageUrl : '';
                    return industry.save();
                });
            });
        });
    }
    /**
     * generate category list schema, check if the cat is on update mode or have an existing _id, else create one
     * @param category
     */
    generateCategoryList(category) {
        return category.map((cat) => (!cat._id ? { _id: uuid(), name: cat, totalBusiness: 0, createdAt: Date.now() } : cat));
    }
    /**
     * update industry counts
     * @param industryId
     * @param data
     */
    updateTotalCounters(industryId, data) {
        return this.findOne({
            _id: industryId
        })
            .then((industry) => {
            return industry.set({
                totalBusiness: data.totalPartners,
                categoryList: industry.categoryList.map((category) => {
                    const ind = data.categoryCounts.findIndex((a) => a.id === category._id);
                    return Object.assign({}, JSON.parse(JSON.stringify(category)), { counts: ind >= 0 ? data.categoryCounts[ind].counts : 0 });
                })
            }).save();
        });
    }
    viewById(industryId) {
        return industry_1.default.findOne({
            _id: industryId
        })
            .sort({
            name: 1
        });
    }
    lists() {
        return this.aggregateWithPagination([
            {
                $sort: {
                    createdAt: 1
                }
            }
        ]);
    }
    /**
     *
     * @param industryId
     * Get lists of the business partners that assigned to be on recommendation/must try.
     */
    getRecommendedBusinessPartners(industryId, data) {
        return this.findOne({ _id: industryId }, { recommended: 1 }).then((data) => {
            return this.BPM.aggregateWithPagination([
                {
                    $match: {
                        _id: { $in: data.recommended.map((recomm) => recomm.businessPartnerId) }
                    }
                }
            ], Object.assign(data, { searchFields: ['name'] }));
        });
    }
    /**
     *
     * @param industryId
     * get the lists of the
     */
    getBusinessPartners(industryId, data) {
        return this.BPM.aggregateWithPagination([
            {
                $match: {
                    industryId
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ], Object.assign(data, { searchFields: ['name'] }));
    }
}
exports.default = Industries;
