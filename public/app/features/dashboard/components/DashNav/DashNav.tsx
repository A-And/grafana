// Libaries
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

// Utils & Services
import { AngularComponent, getAngularLoader } from 'app/core/services/AngularLoader';
import { appEvents } from 'app/core/app_events';
import { PlaylistSrv } from 'app/features/playlist/playlist_srv';

// Components
import { DashNavButton } from './DashNavButton';

// State
import { updateLocation } from 'app/core/actions';

// Types
import { DashboardModel } from '../../state/DashboardModel';
// import { TimePicker, RefreshPicker } from '@grafana/ui';
// import moment from 'moment';

export interface Props {
  dashboard: DashboardModel;
  editview: string;
  isEditing: boolean;
  isFullscreen: boolean;
  $injector: any;
  updateLocation: typeof updateLocation;
  onAddPanel: () => void;
}

export class DashNav extends PureComponent<Props> {
  timePickerEl: HTMLElement;
  timepickerCmp: AngularComponent;
  playlistSrv: PlaylistSrv;

  constructor(props: Props) {
    super(props);

    this.playlistSrv = this.props.$injector.get('playlistSrv');
  }

  componentDidMount() {
    const loader = getAngularLoader();

    const template =
      '<gf-time-picker class="gf-timepicker-nav" dashboard="dashboard" ng-if="!dashboard.timepicker.hidden" />';
    const scopeProps = { dashboard: this.props.dashboard };

    this.timepickerCmp = loader.load(this.timePickerEl, scopeProps, template);
  }

  componentWillUnmount() {
    if (this.timepickerCmp) {
      this.timepickerCmp.destroy();
    }
  }

  onOpenSearch = () => {
    appEvents.emit('show-dash-search');
  };

  onClose = () => {
    if (this.props.editview) {
      this.props.updateLocation({
        query: { editview: null },
        partial: true,
      });
    } else {
      this.props.updateLocation({
        query: { panelId: null, edit: null, fullscreen: null },
        partial: true,
      });
    }
  };

  onToggleTVMode = () => {
    appEvents.emit('toggle-kiosk-mode');
  };

  onSave = () => {
    const { $injector } = this.props;
    const dashboardSrv = $injector.get('dashboardSrv');
    dashboardSrv.saveDashboard();
  };

  onOpenSettings = () => {
    this.props.updateLocation({
      query: { editview: 'settings' },
      partial: true,
    });
  };

  onStarDashboard = () => {
    const { dashboard, $injector } = this.props;
    const dashboardSrv = $injector.get('dashboardSrv');

    dashboardSrv.starDashboard(dashboard.id, dashboard.meta.isStarred).then(newState => {
      dashboard.meta.isStarred = newState;
      this.forceUpdate();
    });
  };

  onPlaylistPrev = () => {
    this.playlistSrv.prev();
  };

  onPlaylistNext = () => {
    this.playlistSrv.next();
  };

  onPlaylistStop = () => {
    this.playlistSrv.stop();
    this.forceUpdate();
  };

  onOpenShare = () => {
    const $rootScope = this.props.$injector.get('$rootScope');
    const modalScope = $rootScope.$new();
    modalScope.tabIndex = 0;
    modalScope.dashboard = this.props.dashboard;

    appEvents.emit('show-modal', {
      src: 'public/app/features/dashboard/components/ShareModal/template.html',
      scope: modalScope,
    });
  };

  render() {
    const { dashboard, isFullscreen, editview, onAddPanel } = this.props;
    const { canStar, canSave, canShare, folderTitle, showSettings, isStarred } = dashboard.meta;
    const { snapshot } = dashboard;

    const haveFolder = dashboard.meta.folderId > 0;
    const snapshotUrl = snapshot && snapshot.originalUrl;

    return (
      <div className="navbar">
        <div>
          <a className="navbar-page-btn" onClick={this.onOpenSearch}>
            <i className="gicon gicon-dashboard" />
            {haveFolder && <span className="navbar-page-btn--folder">{folderTitle} / </span>}
            {dashboard.title}
            <i className="fa fa-caret-down" />
          </a>
        </div>

        <div className="navbar__spacer" />

        {this.playlistSrv.isPlaying && (
          <div className="navbar-buttons navbar-buttons--playlist">
            <DashNavButton
              tooltip="Go to previous dashboard"
              classSuffix="tight"
              icon="fa fa-step-backward"
              onClick={this.onPlaylistPrev}
            />
            <DashNavButton
              tooltip="Stop playlist"
              classSuffix="tight"
              icon="fa fa-stop"
              onClick={this.onPlaylistStop}
            />
            <DashNavButton
              tooltip="Go to next dashboard"
              classSuffix="tight"
              icon="fa fa-forward"
              onClick={this.onPlaylistNext}
            />
          </div>
        )}

        <div className="navbar-buttons navbar-buttons--actions">
          {canSave && (
            <DashNavButton
              tooltip="Add panel"
              classSuffix="add-panel"
              icon="gicon gicon-add-panel"
              onClick={onAddPanel}
            />
          )}

          {canStar && (
            <DashNavButton
              tooltip="Mark as favorite"
              classSuffix="star"
              icon={`${isStarred ? 'fa fa-star' : 'fa fa-star-o'}`}
              onClick={this.onStarDashboard}
            />
          )}

          {canShare && (
            <DashNavButton
              tooltip="Share dashboard"
              classSuffix="share"
              icon="fa fa-share-square-o"
              onClick={this.onOpenShare}
            />
          )}

          {canSave && (
            <DashNavButton tooltip="Save dashboard" classSuffix="save" icon="fa fa-save" onClick={this.onSave} />
          )}

          {snapshotUrl && (
            <DashNavButton
              tooltip="Open original dashboard"
              classSuffix="snapshot-origin"
              icon="fa fa-link"
              href={snapshotUrl}
            />
          )}

          {showSettings && (
            <DashNavButton
              tooltip="Dashboard settings"
              classSuffix="settings"
              icon="fa fa-cog"
              onClick={this.onOpenSettings}
            />
          )}
        </div>

        <div className="navbar-buttons navbar-buttons--tv">
          <DashNavButton
            tooltip="Cycke view mode"
            classSuffix="tv"
            icon="fa fa-desktop"
            onClick={this.onToggleTVMode}
          />
        </div>

        {/* <div className="navbar-buttons">
          <TimePicker
            isTimezoneUtc={false}
            value={{ from: moment(), to: moment(), raw: { from: 'now', to: 'now' } }}
            onChange={() => {}}
            selectTimeOptions={[
              { from: 'now-5m', to: 'now', display: 'Last 5 minutes', section: 3, active: false },
              { from: 'now-15m', to: 'now', display: 'Last 15 minutes', section: 3, active: false },
              { from: 'now-30m', to: 'now', display: 'Last 30 minutes', section: 3, active: false },
              { from: 'now-1h', to: 'now', display: 'Last 1 hour', section: 3, active: false },
              { from: 'now-3h', to: 'now', display: 'Last 3 hours', section: 3, active: false },
              { from: 'now-6h', to: 'now', display: 'Last 6 hours', section: 3, active: false },
              { from: 'now-12h', to: 'now', display: 'Last 12 hours', section: 3, active: false },
              { from: 'now-24h', to: 'now', display: 'Last 24 hours', section: 3, active: false },
            ]}
            popOverTimeOptions={{
              '0': [
                {
                  from: 'now-2d',
                  to: 'now',
                  display: 'Last 2 days',
                  section: 0,
                  active: false,
                },
                {
                  from: 'now-7d',
                  to: 'now',
                  display: 'Last 7 days',
                  section: 0,
                  active: false,
                },
                {
                  from: 'now-30d',
                  to: 'now',
                  display: 'Last 30 days',
                  section: 0,
                  active: false,
                },
                {
                  from: 'now-90d',
                  to: 'now',
                  display: 'Last 90 days',
                  section: 0,
                  active: false,
                },
                {
                  from: 'now-6M',
                  to: 'now',
                  display: 'Last 6 months',
                  section: 0,
                  active: false,
                },
                {
                  from: 'now-1y',
                  to: 'now',
                  display: 'Last 1 year',
                  section: 0,
                  active: false,
                },
                {
                  from: 'now-2y',
                  to: 'now',
                  display: 'Last 2 years',
                  section: 0,
                  active: false,
                },
                {
                  from: 'now-5y',
                  to: 'now',
                  display: 'Last 5 years',
                  section: 0,
                  active: false,
                },
              ],
              '1': [
                {
                  from: 'now-1d/d',
                  to: 'now-1d/d',
                  display: 'Yesterday',
                  section: 1,
                  active: false,
                },
                {
                  from: 'now-2d/d',
                  to: 'now-2d/d',
                  display: 'Day before yesterday',
                  section: 1,
                  active: false,
                },
                {
                  from: 'now-7d/d',
                  to: 'now-7d/d',
                  display: 'This day last week',
                  section: 1,
                  active: false,
                },
                {
                  from: 'now-1w/w',
                  to: 'now-1w/w',
                  display: 'Previous week',
                  section: 1,
                  active: false,
                },
                {
                  from: 'now-1M/M',
                  to: 'now-1M/M',
                  display: 'Previous month',
                  section: 1,
                  active: false,
                },
                {
                  from: 'now-1y/y',
                  to: 'now-1y/y',
                  display: 'Previous year',
                  section: 1,
                  active: false,
                },
              ],
              '2': [
                {
                  from: 'now/d',
                  to: 'now/d',
                  display: 'Today',
                  section: 2,
                  active: true,
                },
                {
                  from: 'now/d',
                  to: 'now',
                  display: 'Today so far',
                  section: 2,
                  active: false,
                },
                {
                  from: 'now/w',
                  to: 'now/w',
                  display: 'This week',
                  section: 2,
                  active: false,
                },
                {
                  from: 'now/w',
                  to: 'now',
                  display: 'This week so far',
                  section: 2,
                  active: false,
                },
                {
                  from: 'now/M',
                  to: 'now/M',
                  display: 'This month',
                  section: 2,
                  active: false,
                },
                {
                  from: 'now/M',
                  to: 'now',
                  display: 'This month so far',
                  section: 2,
                  active: false,
                },
                {
                  from: 'now/y',
                  to: 'now/y',
                  display: 'This year',
                  section: 2,
                  active: false,
                },
                {
                  from: 'now/y',
                  to: 'now',
                  display: 'This year so far',
                  section: 2,
                  active: false,
                },
              ],
            }}
          />
          <RefreshPicker
            onIntervalChanged={() => {}}
            onRefreshClicked={() => {}}
            intervals={[]}
            initialValue={undefined}
          />
        </div> */}

        <div className="gf-timepicker-nav" ref={element => (this.timePickerEl = element)} />

        {(isFullscreen || editview) && (
          <div className="navbar-buttons navbar-buttons--close">
            <DashNavButton
              tooltip="Back to dashboard"
              classSuffix="primary"
              icon="fa fa-reply"
              onClick={this.onClose}
            />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  updateLocation,
};

export default connect(mapStateToProps, mapDispatchToProps)(DashNav);
