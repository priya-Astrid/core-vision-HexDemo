class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.page = Number(queryString.page) || 1;
    this.limit = Number(queryString.limit) || 10;
  }
  //search
  search(fields) {
    if (this.queryString.search) {
      const keyword = this.queryString.search;
      this.query = this.query.find({
        $or: fields.map((field) => ({
          [field]: { $regex: keyword, $options: "i" },
        })),
      });
    }
    return this;
  }
  //filter
  filter() {
    const queryObj = { ...this.queryString };
    const excluded = [
      "page",
      "limit",
      "sort",
      "search"
    ];
    excluded.forEach((el) => delete queryObj[el]);
    Object.keys(queryObj).forEach((key) => {
      const val = String(queryObj[key]);
      if (val.includes(",")) {
        this.query = this.query.find({
          [key]: { $in: queryObj[key].split(",") },
        });
      } else {
        this.query = this.query.find({
          [key]: queryObj[key],
        });
      }
    });
    return this;
  }
  // range filter (generic)
  range(field, minKey, maxKey) {
    const min = this.queryString[minKey];
    const max = this.queryString[maxKey];
    if (min || max) {
      let obj = {};
      if (min) obj.$gte = Number(min);
      if (max) obj.$lte = Number(max);

      this.query = this.query.find({ [field]: obj });
    }
    return this;
  }
  //   sort
  sort() {
    if (this.queryString.sort) {
      const [field, order] = this.queryString.sort.split(",");
      const sortBy = order === "asc" ? field : `-${field}`;
      this.query = this.query.sort(sortBy);
    }
    else{
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  //   pagination
  paginate() {
    const skip = (this.page - 1) * this.limit;
    this.query = this.query.skip(skip).limit(this.limit);
    return this;
  }
  //   populate
  populate(path, select) {
    this.query = this.query.populate(path, select);
    return this;
  }
}

module.exports = APIFeatures;
