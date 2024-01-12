import { customElement, FASTElement, html, observable, repeat, when } from '@microsoft/fast-element';
import { RowItem, buildData } from './utils/build-dummy-data';

const template = html<BenchmarkApp>`
  <div class="jumbotron">
    <div class="row">
      <div class="col-md-6">
        <h1>Fast Framework - non-keyed</h1>
      </div>
      <div class="col-md-6">
        <div class="row">
          <div class="col-sm-6 smallpad">
            <button type="button" class="btn btn-primary btn-block" id="run" @click=${x => x.run()}>
              Create 1,000 rows
            </button>
          </div>
          <div class="col-sm-6 smallpad">
            <button type="button" class="btn btn-primary btn-block" id="runlots" @click=${x => x.runLots()}>
              Create 10,000 rows
            </button>
          </div>
          <div class="col-sm-6 smallpad">
            <button type="button" class="btn btn-primary btn-block" id="add" @click=${x => x.add()}>
              Append 1,000 rows
            </button>
          </div>
          <div class="col-sm-6 smallpad">
            <button type="button" class="btn btn-primary btn-block" id="update" @click=${x => x.update()}>
              Update every 10th row
            </button>
          </div>
          <div class="col-sm-6 smallpad">
            <button type="button" class="btn btn-primary btn-block" id="clear" @click=${x => x.clear()}>Clear</button>
          </div>
          <div class="col-sm-6 smallpad">
            <button type="button" class="btn btn-primary btn-block" id="swaprows" @click=${x => x.swapRows()}>
              Swap Rows
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <table class="table table-hover table-striped test-data" @click=${(x, c) => x.handleClick(c.event)}>
    <tbody id="tbody">
      ${repeat(
        x => x.rows,
        html<RowItem>`
          <tr data-id="${row => row.id}" class="${(row, c) => (c.parent.selectedRowId === row.id ? 'danger' : '')}">
            <td class="col-md-1">${row => row.id}</td>
            <td class="col-md-4">
              <a data-action="select" data-id="${row => row.id}">${row => row.label}</a>
            </td>
            <td class="col-md-1">
              <a
                ><span
                  class="remove glyphicon glyphicon-remove"
                  aria-hidden="true"
                  data-action="removeRow"
                  data-id="${x => x.id}"
                ></span
              ></a>
            </td>
            <td class="col-md-6"></td>
          </tr>
        `
      )}
    </tbody>
  </table>
`;

/**
 * We're using `shadowOptions: null` to avoid Shadow DOM.
 * This way we can get global Bootstrap styles applied
 * because our component is rendered to Light DOM.
 *
 * https://www.fast.design/docs/fast-element/working-with-shadow-dom#shadow-dom-configuration
 */
@customElement({
  name: 'benchmark-app',
  template,
  shadowOptions: null
})
export class BenchmarkApp extends FASTElement {
  @observable rows: RowItem[] = [];
  @observable selectedRowId?: undefined | string;

  run() {
    this.rows = buildData();
    this.selectedRowId = undefined;
  }

  runLots() {
    this.rows = buildData(10000);
    this.selectedRowId = undefined;
  }

  add() {
    this.rows = this.rows ? this.rows.concat(buildData(1000)) : buildData();
  }

  update() {
    for (let i = 0; i < this.rows.length; i += 10) {
      this.rows[i].label += ' !!!';
    }
  }

  clear() {
    this.rows = [];
  }

  /**
   * The observation system cannot track changes made directly
   * through an index update. e.g. arr[3] = 'new value';.
   * This is due to a limitation in JavaScript.
   *
   * To work around this, update arrays with the
   * equivalent splice code e.g. arr.splice(3, 1, 'new value');
   *
   * https://www.fast.design/docs/fast-element/observables-and-state/#observing-arrays
   */
  swapRows() {
    if (this.rows.length > 998) {
      const secondRow = this.rows[1];
      const secondToLastRow = this.rows[998];
      this.rows.splice(1, 1, secondToLastRow);
      this.rows.splice(998, 1, secondRow);
    }
  }

  select(rowId: string) {
    this.selectedRowId = rowId;
  }

  removeRow(rowId: string) {
    const rowIndex = this.rows.findIndex(row => row.id === rowId);
    if (rowIndex > -1) {
      this.rows.splice(rowIndex, 1);
    }
  }

  handleClick(event: Event) {
    const target = event.target as HTMLElement;
    const { action, id } = target.dataset;

    if (action && id) {
      action === 'select' ? this.select(id) : this.removeRow(id);
    }
  }
}
