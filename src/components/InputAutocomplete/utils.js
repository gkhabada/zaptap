// @ts-check

/** @typedef {[{aliases: String, unit: String, detail_name: String, detail_id: Number}]} itemsType */

/**
 *
 * @param {Worker} worker
 */
export function getAutocomplete(worker) {
  /** @type {itemsType} */
  const items = Array.isArray(this.items) ? this.items : [];
  /** @type {String} */
  const search = String(this.search || '').toUpperCase();

  const result = items.map(item => {
    const {
      aliases: aliases_ = '',
      unit: unit_ = '',
      detail_name = '',
      detail_id = 0,
    } = item || {};
    const aliases = aliases_.toUpperCase();
    const unit = unit_.toUpperCase();
    const name = detail_name.toUpperCase();
    if (!isFinite(detail_id) || isNaN(detail_id)) return;
    const found = [];
    const foundInNameIndex = name.indexOf(search);
    /** new release */
    if (foundInNameIndex >= 0) {
      let position = 0;
      let counter = 0;
      while (position < name.length) {
        if (++counter > 5) {
          break;
        }
        const currentName = name.slice(position);
        const foundInCurrentNameIndex = currentName.indexOf(search);
        if (~foundInCurrentNameIndex) {
          if (foundInCurrentNameIndex > 0) {
            found.push({
              text: detail_name.slice(
                position,
                position + foundInCurrentNameIndex,
              ),
            });
            position += foundInCurrentNameIndex;
            continue;
          }
          found.push({
            text: detail_name.slice(position, position + search.length),
            hint: true,
          });
          position += search.length;
          continue;
        } else {
          found.push({
            text: detail_name.slice(position, position + currentName.length),
          });
          break;
        }
      }
      return {
        inlist: true,
        found,
        detail_name,
        detail_id,
      };
    }
    if (aliases.includes(search)) {
      found.push({
        text: detail_name,
      });
      return {
        inlist: true,
        found,
        detail_name,
        detail_id,
      };
    }
    if (unit.includes(search)) {
      found.push({
        text: detail_name,
      });
      return {
        inlist: true,
        found,
        detail_name,
        detail_id,
      };
    }
  });
  worker.postMessage(result);
}
