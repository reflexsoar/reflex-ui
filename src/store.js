import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex)

const state = {
  cancelToken: Axios.CancelToken,
  eventSearchCancelToken: null,
  eventFilterCancelToken: null,
  eventDrawerShow: 'responsive',
  eventDrawerMinimize: true,
  mitreDrawerShow: 'responsive',
  mitreDrawerMinimize: true,
  logDrawerShow: 'responsive',
  logDrawerMinimize: true,
  searchWorkspaceLog: {},
  sidebarShow: 'responsive',
  sidebarMinimize: false,
  status: '',
  access_token: localStorage.getItem('access_token') || '',
  refresh_token: localStorage.getItem('refresh_token') || '',
  current_user: {
    'permissions': [],
    'default_org': false
  },
  global_tenant: false,
  show_tenant_controls: false,
  mfa_enabled: false,
  audit_logs: [],
  dashboard_metrics: {},
  credentials: [],
  credential: {},
  events: [],
  event: {},
  event_comments: [],
  event_comments_pagination: {},
  cases: [],
  case: {},
  tags: {},
  tag: [],
  case_task_notes: [],
  case_templates: [],
  case_template: {},
  case_statuses: [],
  case_status: {},
  case_tasks: [],
  case_task: {},
  case_history: [],
  case_files: [],
  case_file: {},
  related_cases: [],
  observables: [],
  observable: {},
  data_types: [],
  data_type: {},
  event_rules: [],
  event_rule: {},
  case_template_list: [],
  unread_event_count: 0,
  agents: [],
  agent: {},
  agent_groups: [],
  agent_group: {},
  close_reasons: [],
  close_reason: {},
  pairing_token: "",
  organizations: [],
  organization: {},
  users: [],
  user: {},
  related_events: [],
  user_groups: [],
  user_group: {},
  roles: [],
  role: {},
  playbooks: [],
  playbook: {},
  plugins: [],
  plugin: {},
  comments: [],
  comment: {},
  event_rules: [],
  plugin_configs: [],
  plugin_config: {},
  inputs: [],
  input: {},
  orguuid: '',
  tag_list: [],
  list: {},
  lists: [],
  detection: {},
  detections: [],
  detection_hits: [],
  pagination: {},
  mitre_tactics: [],
  mitre_techniques: [],
  mitre_technique: {},
  credential_list: [],
  intel_filters: [],
  index_fields: [],
  agent_policies: [],
  agent_policy: {},
  mitre_data_sources: [],
  service_accounts: [],
  integrations: [],
  integration: {},
  integration_configs: [],
  integration_config: {},
  detection_filters: {
    repo_synced: true,
    active: true,
  },
  selected_detection_filters: {},
  observable_filters: [{ 'filter_type': 'status', 'data_type': 'status', 'value': 'New' }],
  case_filters: [{ 'filter_type': 'status', 'data_type': 'status', 'value': 'New' }],
  alert: {
    'show': false,
    'message': '',
    'type': 'success'
  },
  settings: {
    'email_secret': {
      'uuid': '',
      'name': '',
      'description': ''
    },
    'require_case_templates': false
  },
  event_stats: {},
  event_rule_stats: {},
  list_stats: {},
  case_stats: {},
  network_data: {},
  loading: false,
  quick_filters: true,
  source_input: {},
  input_list: [],
  list_values: [],
  list_names: [],
  toasts: [],
  toasted: [],
  running_tasks: [],
  notification_channel: {},
  notification_channels: [],
  formatted_notification_channels: [],
  field_template: {},
  field_templates: [],
  source_field_template: {},
  valid_data_types: ["none", "url", "user", "sid", "sha256hash", "sha1hash", "process", "port",
    "pid", "md5hash", "mac", "ip", "imphash", "host", "generic", "fqdn", "filepath",
    "email_subject", "email", "domain", "detection_id", "command"],
  detection_repository: {},
  detection_repositories: [],
  event_views: [],
  mitre_mapping: {},
  configured_actions: [],
  sso_providers: [],
  sso_provider: {},
  sso_role_mappings: [],
  sso_role_mapping: {},
  integration_outputs: [],
  data_source_templates: [],
  schedules: [],
  release_notes: {},
  previous_versions: [],
  fim_rule: {},
  fim_rules: [],
  benchmark_rule: {},
  benchmark_rules: [],
  benchmark_metric: {},
  benchmark_metrics: {},
  agent_tag: {},
  agent_tags: [],
  agent_logs: [],
  benchmark_assets: [],
  log_searches: [],
  base_url: "",
  repository_subscription: {},
  application_summary: {
    total: 0,
    applications: []
  },
  application_endpoints: {
    endpoints: [],
    total: 0
  },
  search_on_change: false
}

const mutations = {
  update_search_on_change(state, search_on_change) {
    state.search_on_change = search_on_change
  },
  save_application_summary(state, summary) {
    state.application_summary = summary
  },
  save_application_endpoints(state, endpoints) {
    state.application_endpoints = endpoints
  },
  set_detection_repository_subscription(state, subscription) {
    state.repository_subscription = subscription
  },
  add_log_search(state, search) {
    state.log_searches.push(search)
  },
  update_log_search(state, search) {
    state.log_searches = state.log_searches.map(s => s.uuid == search.uuid ? search : s)
  },
  remove_log_search(state, uuid) {
    state.log_searches = state.log_searches.filter(s => s.uuid != uuid)
  },
  clear_log_searches(state) {
    state.log_searches = []
  },
  save_benchmark_assets(state, assets) {
    state.benchmark_assets = assets
  },
  save_agent_logs (state, logs) {
    state.agent_logs = logs
  },
  save_agent_tags(state, tags) {
    state.agent_tags = tags
  },
  save_agent_tag(state, tag) {
    state.agent_tag = tag
  },
  add_agent_tag(state, tag) {
    state.agent_tags = [...state.agent_tags.filter(t => t.uuid != tag.uuid), tag]
  },
  remove_agent_tag(state, uuid) {
    state.agent_tags = state.agent_tags.filter(t => t.uuid != uuid)
  },
  update_agent_tag(state, tag) {
    state.agent_tags = state.agent_tags.map(t => t.uuid == tag.uuid ? tag : t)
  },
  save_benchmark_metrics(state, metrics) {
    state.benchmark_metrics = metrics
  },
  save_benchmark_rules(state, rules) {
    state.benchmark_rules = rules
  },
  save_benchmark_rule(state, rule) {
    state.benchmark_rule = rule
  },
  add_benchmark_rule(state, rule) {
    state.benchmark_rules = [...state.benchmark_rules.filter(r => r.uuid != rule.uuid), rule]
  },
  update_benchmark_rule(state, rule) {
    state.benchmark_rules = [...state.benchmark_rules.filter(r => r.uuid != rule.uuid), rule]
  },
  remove_benchmark_rule(state, uuid) {
    state.benchmark_rules = state.benchmark_rules.filter(r => r.uuid != uuid)
  },
  save_release_notes(state, data) {
    state.release_notes = data.notes
    state.previous_versions = data.previous_versions
  },
  save_schedules(state, schedules) {
    state.schedules = schedules
  },
  add_schedule(state, schedule) {
    if (state.schedules.length == 0) {
      state.schedules = []
    }
    state.schedules.push(schedule)
  },
  add_fim_rule(state, rule) {
    state.fim_rules = [...state.fim_rules, rule]
  },
  update_fim_rule(state, rule) {
    state.fim_rules = [...state.fim_rules.filter(r => r.uuid != rule.uuid), rule]
  },
  remove_fim_rule(state, uuid) {
    state.fim_rules = state.fim_rules.filter(r => r.uuid != uuid)
  },
  save_fim_rules(state, rules) {
    state.fim_rules = rules
  },
  update_schedule(state, schedule) {
    state.schedules = [...state.schedules.filter(s => s.uuid != schedule.uuid), schedule]
  },
  remove_schedule(state, uuid) {
    state.schedules = state.schedules.filter(s => s.uuid != uuid)
  },
  save_data_source_templates(state, templates) {
    state.data_source_templates = templates
  },
  add_data_source_template(state, template) {
    if (state.data_source_templates.length == 0) {
      state.data_source_templates = []
    }
    state.data_source_templates.push(template)
  },
  update_data_source_template(state, template) {
    state.data_source_templates = state.data_source_templates.map(t => t.uuid == template.uuid ? template : t)
  },
  remove_data_source_template(state, uuid) {
    state.data_source_templates = state.data_source_templates.filter(t => t.uuid != uuid)
  },
  save_outputs(state, outputs) {
    state.integration_outputs = outputs
  },
  save_sso_providers(state, providers) {
    state.sso_providers = providers
  },
  add_sso_provider(state, provider) {
    state.sso_providers.push(provider)
    state.sso_provider = provider
  },
  update_sso_provider(state, provider) {
    state.sso_provider = provider
    state.sso_providers = [...state.sso_providers.filter(r => r.uuid != provider.uuid), provider]
  },
  delete_sso_provider(state, uuid) {
    state.sso_provider = {}
    state.sso_providers = state.sso_providers.filter(r => r.uuid != uuid)
  },
  save_sso_role_mappings(state, mappings) {
    state.sso_role_mappings = mappings
  },
  add_sso_role_mapping(state, mapping) {
    if (state.sso_role_mappings.length == 0) {
      state.sso_role_mappings = [mapping]
    } else {
      state.sso_role_mappings.push(mapping)
    }
    state.sso_role_mapping = mapping
  },
  update_sso_role_mapping(state, mapping) {
    state.sso_role_mapping = mapping
    state.sso_role_mappings = [...state.sso_role_mappings.filter(m => m.uuid != mapping.uuid), mapping]
  },
  delete_sso_role_mapping(state, uuid) {
    state.sso_role_mapping = {}
    state.sso_role_mappings = state.sso_role_mappings.filter(m => m.uuid != uuid)
  },
  save_detection_mitre_mapping(state, mitre_mapping) {
    state.mitre_mapping = mitre_mapping
  },
  save_event_views(state, event_views) {
    state.event_views = event_views
  },
  add_task(state, task) {
    state.running_tasks.push(task)
  },
  delete_task(state, task) {
    state.running_tasks = state.running_tasks.filter(item => item != task)
  },
  add_toast(state, toast) {
    if (!state.toasts.find(o => o.key === toast.key)) {
      state.toasts.push(toast)
    }
  },
  toggleSidebarDesktop(state) {
    const sidebarOpened = [true, 'responsive'].includes(state.sidebarShow)
    state.sidebarShow = sidebarOpened ? false : 'responsive'
  },
  toggleSidebarMobile(state) {
    const sidebarClosed = [false, 'responsive'].includes(state.sidebarShow)
    state.sidebarShow = sidebarClosed ? true : 'responsive'
  },
  set(state, [variable, value]) {
    state[variable] = value
  },
  auth_request(state) {
    state.status = 'loading'
  },
  loading_status(state, status) {
    state.loading = status
  },
  auth_success(state, data) {
    state.status = 'success'
    state.access_token = data['access_token']
    state.refresh_token = data['refresh_token']
  },
  auth_mfa_check(state) {
    state.status = 'mfa_check'
  },
  auth_error(state) {
    state.status = 'error'
  },
  refresh_error(state) {
    state.status = 'error'
  },
  refresh_request(state) {
    state.status = 'loading'
  },
  refresh_success(state, data) {
    state.status = 'success'
    state.access_token = data['access_token']
    state.refresh_token = data['refresh_token']
  },
  save_current_user(state, user) {
    state.current_user = user
    state.success = 'success'
  },
  save_credentials(state, credentials) {
    state.credentials = credentials
  },
  save_case_template_list(state, templates) {
    state.case_template_list = templates
  },
  save_playbooks(state, credentials) {
    state.playbooks = credentials
  },
  save_events(state, events) {
    state.events = events
  },
  save_multiple_events(state, events) {
    for (let evt in events) {
      state.events = [...state.events.filter(e => e.uuid != evt.uuid)]
    }
  },
  save_event(state, event) {
    state.event = event
    if (state.events.length > 0) {
      state.events = [...state.events.filter(e => e.uuid != event.uuid), event]
    } else {
      state.events = [event]
    }
  },
  save_list_values(state, values) {
    state.list_values = values
  },
  save_list_stats(state, stats) {
    state.list_names = stats['lists']
    delete stats['lists']
    state.list_stats = stats
  },
  save_agent_policy(state, policy) {
    state.agent_policy = policy
    if (state.agent_policies.length > 0) {
      state.agent_policies = [...state.agent_policies.filter(p => p.uuid != policy.uuid), policy]
    } else {
      state.agent_policies = [policy]
    }
  },
  save_agent_policies(state, policies) {
    state.agent_policies = policies
  },
  save_field_template(state, template) {
    state.field_template = template
    if (state.field_templates.length > 0) {
      state.field_templates = [...state.field_templates.filter(t => t.uuid != template.uuid), template]
    } else {
      state.field_templates = [template]
    }
  },
  save_field_templates(state, templates) {
    state.field_templates = templates
  },
  save_event_stats(state, stats) {
    state.event_stats = stats
  },
  save_event_rule_stats(state, stats) {
    state.event_rule_stats = stats
  },
  save_case_stats(state, stats) {
    state.case_stats = stats
  },
  save_audit_logs(state, logs) {
    state.audit_logs = logs
  },
  save_lists(state, lists) {
    state.lists = lists
  },
  save_list(state, list) {
    state.list = list
    if (state.lists.length > 0) {
      state.lists = [...state.lists.filter(l => l.uuid != list.uuid), list]
    } else {
      state.lists = [list]
    }
  },
  add_list(state, list) {
    if (state.lists.length == 0) {
      state.lists = [list]
    } else {
      state.lists.push(list)
    }
    state.list = list
  },
  save_case_task_notes(state, notes) {
    state.case_task_notes = notes
  },
  add_case_task_note(state, note) {
    if (state.case_task_notes.length == 0) {
      state.case_task_notes = [note]
    } else {
      state.case_task_notes.push(note)
    }
  },
  save_comments(state, comments) {
    state.comments = comments
  },
  save_comment(state, comment) {
    state.comment = comment
  },
  add_comment(state, comment) {
    state.comments.push(comment)
    state.comment = comment
  },
  save_event_comments(state, comments) {
    state.event_comments = comments
  },
  save_event_comments_pagination(state, pagination) {
    state.event_comments_pagination = pagination
  },
  add_event_comment(state, comment) {
    if (state.event_comments.length == 0) {
      state.event_comments = [comment]
    } else {
      state.event_comments = [comment, ...state.event_comments]
    }
  },
  update_selected_detection_filters(state, filters) {
    state.selected_detection_filters = filters
  },
  update_detection_filters(state, filters) {
    state.detection_filters = filters
  },
  update_observable_filters(state, filters) {
    state.observable_filters = filters
  },
  update_case_filters(state, filters) {
    state.case_filters = filters
  },
  update_intel_filters(state, filters) {
    state.intel_filters = filters
  },
  update_case_comment(state, comment) {
    state.comment = comment
    state.comments = state.comments.map(c => c.uuid == comment.uuid ? comment : c)
  },
  remove_comment(state, uuid) {
    state.comments = state.comments.filter(comment => comment.uuid !== uuid)
  },
  save_close_reasons(state, reasons) {
    state.close_reasons = reasons
  },
  save_close_reason(state, reason) {
    state.close_reason = reason
  },
  add_close_reason(state, reason) {
    state.close_reasons.push(reason)
    state.close_reason = reason
  },
  save_data_types(state, data) {
    state.data_types = data
  },
  save_data_type(state, data) {
    state.data_type = data
  },
  add_data_type(state, data) {
    state.data_types.push(data)
    state.data_type = data
  },
  save_event_rules(state, data) {
    state.event_rules = data
  },
  save_event_rule(state, event_rule) {
    state.event_rule = event_rule
    state.event_rules = [...state.event_rules.filter(e => e.uuid != event_rule.uuid), event_rule]
  },
  update_event_rule(state, event_rule) {
    state.event_rule = event_rule
    state.event_rules = state.event_rules.map(e => e.uuid == event_rule.uuid ? event_rule : e)
  },
  add_event_rule(state, data) {
    state.event_rules.push(data)
    state.event_rule = data
  },
  save_agents(state, agents) {
    state.agents = agents
  },
  save_agent(state, agent) {
    state.agent = agent
  },
  save_case_statuses(state, statuses) {
    state.case_statuses = statuses
  },
  save_case_status(state, status) {
    state.status = status
  },
  save_cases(state, cases) {
    state.cases = cases
  },
  save_case_history(state, history) {
    state.case_history = history
  },
  save_case_files(state, case_files) {
    state.case_files = case_files
  },
  save_case_file(state, case_file) {
    state.case_file = case_file
    state.case_files.push(case_file)
  },
  remove_case_file(state, uuid) {
    state.case_file = {}
    state.case_files = state.case_files.filter(c => c.uuid !== uuid)
  },
  save_tags(state, tags) {
    state.tags = tags
  },
  save_case_templates(state, templates) {
    state.case_templates = templates
  },
  save_case(state, c) {
    state.case = c
  },
  update_case(state, c) {
    state.case = c
    state.cases = state.cases.map(x => x.uuid == c.uuid ? c : x)
  },
  save_related_cases(state, data) {
    state.related_cases = data
  },
  save_dashboard_metrics(state, metrics) {
    state.dashboard_metrics = metrics
  },
  save_observables(state, observables) {
    state.observables = observables
  },
  save_observable(state, observable) {
    state.observable = observable
  },
  add_observable(state, observable) {
    state.observables.push(observable)
    state.observable = observable
  },
  update_observable(state, observable) {
    state.observable = observable
    state.observables = state.observables.map(o => o.value == observable.value ? observable : o)
  },
  update_observables(state, observables) {
    for (let obs in observables) {
      let observable = observables[obs]
      state.observables = state.observables.map(o => o.value == observable.value ? observable : o)
    }
  },
  save_agent_group(state, agent_group) {
    state.agent_group = agent_group
    if (state.agent_groups.length > 0) {
      state.agent_groups = [...state.agent_groups.filter(g => g.uuid != agent_group.uuid), agent_group]
    } else {
      state.agent_groups = [agent_group]
    }
  },
  update_agent_group(state, agent_group) {
    state.agent_group = agent_group
    state.agent_groups = state.agent_groups.map(ag => ag.uuid == agent_group.uuid ? agent_group : ag)
  },
  update_agent(state, agent) {
    state.agent = agent
    state.agents = state.agents.map(a => a.uuid == agent.uuid ? agent : a)
  },
  remove_agent(state, uuid) {
    state.agents = state.agents.filter(a => a.uuid !== uuid)
  },
  remove_agent_group(state, uuid) {
    state.agent_groups = state.agent_groups.filter(a => a.uuid !== uuid)
  },
  save_settings(state, settings) {
    state.settings = settings
  },
  save_agent_groups(state, agent_groups) {
    state.agent_groups = agent_groups
  },
  save_users(state, users) {
    state.users = users
  },
  save_user_groups(state, groups) {
    state.user_groups = groups
  },
  save_user(state, user) {
    state.user = user
    state.users = [...state.users.filter(u => u.uuid != user.uuid), user]
  },
  add_organization(state, organization) {
    state.organizations.push(organization)
    state.organization = organization
  },
  save_organizations(state, organizations) {
    state.organizations = organizations
  },
  save_organization(state, organization) {
    state.organization = organization
  },
  update_organization(state, org) {
    state.organizations = state.organizations.map(x => x.uuid == org.uuid ? org : x)
    state.organization = org
  },
  remove_list(state, uuid) {
    state.list = {}
    state.lists = state.lists.filter(a => a.uuid !== uuid)
  },
  remove_user(state, user) {
    state.user = {}
  },
  save_roles(state, roles) {
    state.roles = roles
  },
  save_role(state, role) {
    state.role = role
  },
  remove_role(state, uuid) {
    state.roles = state.roles.filter(role => role.uuid !== uuid)
  },
  save_credential(state, credential) {
    state.credential = credential
  },
  update_credential(state, cred) {
    state.credential = cred
    state.credentials = state.credentials.map(c => c.uuid == cred.uuid ? cred : c)
  },
  remove_credential(state, uuid) {
    state.credentials = state.credentials.filter(c => c.uuid != uuid)
  },
  save_playbook(state, playbook) {
    state.playbook = playbook
  },
  save_plugin(state, plugin) {
    state.plugin = plugin
  },
  save_plugins(state, plugins) {
    state.plugins = plugins
  },
  save_plugin_config(state, plugin_config) {
    state.plugin_config = plugin_config
  },
  save_plugin_configs(state, plugin_configs) {
    state.plugin_configs = plugin_configs
  },
  save_inputs(state, inputs) {
    state.inputs = inputs
  },
  save_inputs_list(state, inputs) {
    state.input_list = inputs.map(item => { return { 'name': item.name, 'uuid': item.uuid, 'signature_fields': item.config.signature_fields } })
  },
  save_input(state, input) {
    state.input = input
  },
  remove_input(state, uuid) {
    state.inputs = state.inputs.filter(a => a.uuid !== uuid)
  },
  update_input(state, input) {
    state.input = input
    state.inputs = state.inputs.map(i => i.uuid == input.uuid ? input : i)
  },
  save_index_fields(state, fields) {
    state.index_fields = fields
  },
  add_detection(state, detection) {
    state.detection = detection

    if (state.detections.length == 0) {
      state.detections = [detection]
    } else {
      state.detections.push(detection)
    }
    state.status = 'success'
  },
  save_detections(state, detections) {
    state.detections = detections
  },
  save_detections_list(state, detections) {
    state.detections_list = detections.map(item => { return { 'name': item.name, 'uuid': item.uuid } })
  },
  save_detection(state, detection) {
    state.detection = detection
  },
  update_detection(state, detection) {
    state.detection = detection
    state.detections = [...state.detections.filter(d => d.uuid != detection.uuid), detection]
  },
  update_detections(state, detections) {
    for (let det in detections) {
      let detection = detections[det]
      state.detections = [...state.detections.filter(d => d.uuid != detection.uuid), detection]
    }
  },
  save_detection_hits(state, hits) {
    state.detection_hits = hits
  },
  save_pairing_token(state, token) {
    state.pairing_token = token
  },
  remove_detection(state, uuid) {
    state.detections = state.detections.filter(a => a.uuid !== uuid)
  },
  add_plugin(state, plugin) {
    state.plugins.push(plugin)
    state.plugin = plugin
    state.stats = 'success'
  },
  add_plugin_config(state, plugin_config) {
    state.plugin_configs.push(plugin_config)
    state.plugin_config = plugin_config
    state.state = 'success'
  },
  add_agent_group(state, agent_group) {
    if (state.agent_groups.length == 0) {
      state.agent_groups = [agent_group]
    } else {
      state.agent_groups.push(agent_group)
    }
    state.agent_group = agent_group
    state.status = 'success'
  },
  add_credential(state, credential) {
    if (state.credentials.length == 0) {
      state.credentials = [credential]
    } else {
      state.credentials.push(credential)
    }
    state.credential = credential
    state.status = 'success'
  },
  add_notification_channel(state, channel) {
    if (state.notification_channels.length == 0) {
      state.notification_channels = [channel]
    } else {
      state.notification_channels.push(channel)
    }
    state.notification_channel = channel
  },
  update_notification_channel(state, channel) {
    state.notification_channel = channel
    state.notification_channels = state.notification_channels.map(c => c.uuid == channel.uuid ? channel : c)
  },
  remove_notification_channel(state, uuid) {
    state.notification_channels = state.notification_channels.filter(c => c.uuid != uuid)
  },
  save_notification_channel(state, channel) {
    state.notification_channel = channel
    state.notification_channels.push(channel)
  },
  save_notification_channels(state, channels) {
    state.notification_channels = channels
  },
  add_case(state, data) {
    state.cases.push(data)
    state.case = data
    state.status = 'success'
  },
  save_case_tasks(state, tasks) {
    state.case_tasks = tasks
  },
  save_case_task(state, task) {
    state.case_task
  },
  update_case_task(state, task) {
    state.case_task = task
    state.case_tasks = state.case_tasks.map(t => t.uuid == task.uuid ? task : t)
  },
  remove_case_task(state, uuid) {
    state.case_task = {}
    state.case_tasks = state.case_tasks.filter(t => t.uuid !== uuid)
  },
  remove_case_template(state, uuid) {
    state.case_template = {}
    state.case_templates = state.case_templates.filter(t => t.uuid !== uuid)
  },
  remove_case(state, uuid) {
    state.cases = state.cases.filter(c => c.uuid != uuid)
    state.case = {}
  },
  remove_agent(state, uuid) {
    state.agents = state.agents.filter(a => a.uuid != uuid)
    state.agent = {}
  },
  remove_event(state, uuid) {
    state.events = state.events.filter(e => e.uuid != uuid)
    state.event = {}
  },
  remove_events(state, events) {
    for (let event in events) {
      state.events = state.events.filter(e => e.uuid != event)
    }
  },
  save_related_events(state, events) {
    state.related_events = events
  },
  add_case_task(state, task) {
    state.case_tasks.push(task)
    state.status = 'success'
  },
  add_case_template(state, data) {
    if (state.case_templates.length == 0) {
      state.case_templates = [data]
    } else {
      state.case_templates.push(data)
    }
    state.case_template = data
    state.status = 'success'
    state.case_template_list.push({ title: data.title, description: data.description, uuid: data.uuid, tags: data.tags, severity: data.severity, task_count: data.task_count, tlp: data.tlp })
    state.tags.concat(data.tags)
  },
  update_case_template(state, data) {
    state.case_template = data
    state.case_templates = state.case_templates.map(t => t.uuid == data.uuid ? data : t)
  },
  add_case_status(state, data) {
    state.case_statuses.push(data)
    state.case_status = data
    state.status = 'success'
  },
  add_case_comment(state, data) {
    state.comments.push(data)
  },
  add_case_observables(state, data) {
    state.case.observables = data
  },
  add_playbook(state, playbook) {
    state.playbooks.push(playbook)
    state.playbook = playbook
    state.status = 'success'
  },
  add_input(state, input) {
    if (state.inputs.length == 0) {
      state.inputs = [...state.inputs.filter(i => i.uuid != input.uuid), input]
    } else {
      state.inputs.push(input)
    }
    state.input = input
    state.status = 'success'
  },
  add_event(state, event) {
    state.events.push(event)
    state.event = event
    state.status = 'success'
  },
  add_user(state, user) {
    if (state.users.length == 0) {
      state.users = [user]
    } else {
      state.users.push(user)
    }
    state.user = user
    state.status = 'success'
  },
  add_role(state, role) {
    state.roles.push(role)
    state.role = role
    state.status = 'success'
  },
  update_role(state, role) {
    state.role = role
    state.roles = state.roles.map(r => r.uuid == role.uuid ? role : r)
  },
  add_detection_repository(state, repo) {
    if (state.detection_repositories.length == 0) {
      state.detection_repositories = [repo]
    } else {
      state.detection_repositories.push(repo)
    }
    state.detection_repository = repo
    state.status = 'success'
  },
  update_detection_repository(state, repo) {
    state.detection_repository = repo
    state.detection_repositories = state.detection_repositories.map(r => r.uuid == repo.uuid ? repo : r)
  },
  remove_detection_repository(state, uuid) {
    state.detection_repository = {}
    state.detection_repositories = state.detection_repositories.filter(r => r.uuid !== uuid)
  },
  save_detection_repositories(state, repos) {
    state.detection_repositories = repos
  },
  save_tactics(state, tactics) {
    state.mitre_tactics = tactics
  },
  save_techniques(state, techniques) {
    state.mitre_techniques = techniques
  },
  save_technique(state, technique) {
    state.mitre_technique = {}
    state.mitre_technique = technique
  },
  add_success(state) {
    state.status = 'success'
  },
  add_start(state) {
    state.status = 'loading'
  },
  tags_success(state, tags) {
    state.tag_list = tags
  },
  creds_success(state, creds) {
    state.credential_list = creds
  },
  inputs_success(state, inputs) {
    state.inputs_list = inputs
  },
  show_alert(state, data) {
    state.alert.message = data['message']
    state.alert.show = true
    state.alert.type = data['type']
  },
  clear_alert(state) {
    state.alert.show = false
    state.alert_message = ''
  },
  tags_error(state) {
    state.tag_list = []
  },
  logout(state) {
    state.status = ''
    state.access_token = ''
  },
  mfa_enabled(state, status) {
    state.mfa_enabled = status
  },
  save_network_data(state, data) {
    state.network_data = data
  },
  set_quick_filter_state(state, data) {
    state.quick_filters = data
  },
  save_pagination(state, pagination) {
    state.pagination = pagination
  },
  clone_input(state, input) {
    state.source_input = input
  },
  clone_field_template(state, template) {
    state.source_field_template = template
  },
  set_mitre_data_sources(state, sources) {
    state.mitre_data_sources = sources
  },
  save_service_accounts(state, accounts) {
    state.service_accounts = accounts
  },
  update_service_account(state, account) {
    state.service_account = account
    state.service_account = state.service_account.map(a => a.uuid == account.uuid ? account : a)
  },
  add_service_account(state, account) {
    state.service_accounts.push(account)
    state.service_account = account
    state.status = 'success'
  },
  store_integrations(state, integrations) {
    state.integrations = integrations
  },
  store_integration_configurations(state, configs) {
    state.integration_configs = configs
  },
  add_integration_configuration(state, config) {
    if (state.integration_configs.length == 0) {
      state.integration_configs = [config]
    } else {
      state.integration_configs.push(config)
    }
    state.integration_config = config
    state.status = 'success'
  },
  update_integration_configuration(state, config) {
    state.integration_config = config
    state.integration_configs = state.integration_configs.map(c => c.uuid == config.uuid ? config : c)
  },
  remove_integration_configuration(state, uuid) {
    state.integration_config = {}
    state.integration_configs = state.integration_configs.filter(c => c.uuid !== uuid)
  },
  store_integration(state, integration) {
    state.integration = integration
  },
  store_configured_actions(state, actions) {
    state.configured_actions = actions
  }
}

const getters = {
  base_url: state => { return state.base_url },
  log_searches: state => { return state.log_searches },
  integration_outputs_select: state => {
    return state.integration_outputs.map(output => { return { label: output.integration_name + " - " + output.name + " - " + output.configuration_name, value: output.value } })
  },
  integration_outputs: state => {
    return state.integration_outputs
  },
  running_tasks: state => { return state.running_tasks },
  list_values: state => { return state.list_values },
  pagination: state => { return state.pagination },
  list_name: state => function (uuid) {
    return state.list_names[uuid]
  },
  severity_color: state => function (severity) {
    switch (severity) {
      case 0: return 'secondary'; // Informational
      case 1: return 'dark';
      case 2: return 'info';
      case 3: return 'warning';
      case 4: return 'danger';
      default: return 'danger';
    }
  },
  severity_text: state => function (severity) {
    switch (severity) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      case 4: return 'Critical';
      default: return 'Unknown';
    }
  },
  org_name: state => function (uuid) {
    let org = state.organizations.filter(o => o.uuid === uuid)
    if (org.length > 0) {
      return org[0].name
    } else {
      return "Unknown"
    }
  },
  agent_policies_list: state => {
    return state.agent_policies.map(p => { return { name: p.name, uuid: p.uuid } })
  },
  observable_filters_state: state => {
    return state.observable_filters
  },
  mitre_technique: state => { return state.mitre_technique },
  event_comments: state => { return state.event_comments },
  event_comments_pagination: state => { return state.event_comments_pagination },
  notification_channels: state => { return state.notification_channels },
  event_rules: state => { return state.event_rules },
  source_input: state => { return state.source_input },
  lists: state => { return state.lists },
  quick_filters: state => { return state.quick_filters },
  loading: state => { return state.loading },
  intel_filters: state => { return state.intel_filters },
  case_filters: state => { return state.case_filters },
  observable_filters: state => { return state.observable_filters },
  organization: state => { return state.organization },
  organizations: state => { return state.organizations },
  formatted_organizations: state => { return state.organizations.map((o) => { return { label: o.name, value: o.uuid } }) },
  network_data: state => { return state.network_data },
  case_stats: state => { return state.case_stats },
  event_stats: state => { return state.event_stats },
  dashboard_metrics: state => { return state.dashboard_metrics },
  list_stats: state => { return state.list_stats },
  eventDrawerShow: state => { return state.eventDrawerShow },
  eventDrawerMinimize: state => { return state.eventDrawerMinimize },
  mitreDrawerShow: state => { return state.mitreDrawerShow },
  mitreDrawerMinimize: state => { return state.mitreDrawerMinimize },
  logDrawerShow: state => { return state.logDrawerShow },
  logDrawerMinimize: state => { return state.logDrawerMinimize },
  searchWorkspaceLog: state => { return state.searchWorkspaceLog },
  mfa_enabled: state => { return state.mfa_enabled },
  isLoggedIn: state => !!state.access_token,
  authStatus: state => state.status,
  addStatus: state => state.status,
  status: state => state.status,
  current_user: state => { return state.current_user },
  alert: state => state.alert,
  agents: state => { return state.agents },
  agent: state => { return state.agent },
  agent_groups: state => { return state.agent_groups },
  case_templates: state => state.case_templates,
  case_template_list: state => { return state.case_template_list },
  date_types: state => state.data_types,
  case_history: state => { return state.case_history },
  comments: state => { return state.comments },
  comment: (state) => function (uuid) { state.comments.find(comment => comment.uuid == uuid) },
  task_notes: (state) => { return state.case_task_notes },
  case_tasks: state => { return state.case_tasks },
  case_task: state => { return state.case_task },
  case_data: state => { return state.case },
  cases: state => { return state.cases },
  users: state => { return state.users },
  roles: state => { return state.roles },
  input: state => { return state.input },
  inputs: state => { return state.inputs },
  observables: state => { return state.observables },
  credentials: state => { return state.credentials },
  credential: state => { return state.credential },
  case_files: state => { return state.case_files },
  related_cases: state => { return state.related_cases },
  events: state => { return state.events },
  close_reasons: state => { return state.close_reasons },
  agent_group: state => { return state.agent_group },
  event: state => { return state.event },
  events: state => { return state.events },
  event_rule: state => { return state.event_rule },
  event_rules: state => { return state.event_rules },
  related_events: state => { return state.related_events },
  related_cases: state => { return state.related_cases },
  audit_logs: state => { return state.audit_logs },
  data_types_list: function () { return state.data_types.map(item => { return { 'label': item.name, 'value': item.uuid } }) },
  user_has_permission: state => function (permission) {
    if (Object.keys(state.current_user.permissions).includes(permission)) {

      if (!state.current_user.permissions[permission] || state.current_user.permissions[permission] === null) {
        return false
      }
      return true

    } else {
      return false
    }

  },
  user_has: state => function (permission) {
    return Object.keys(state.current_user.permissions).includes(permission)
  },
  tags: state => state.tags,
  service_accounts: state => { return state.service_accounts },
  valid_data_types: state => { return state.valid_data_types },
}

let BASE_URL = ""
if (process.env.NODE_ENV == 'development') {
  BASE_URL = location.protocol + '//' + window.location.hostname + '/api/v2.0'
  // Set the base_url in the store
  state.base_url = BASE_URL
} else {
  BASE_URL = location.protocol + '//' + window.location.host + '/api/v2.0'
  // Set the base_url in the store
  state.base_url = BASE_URL
}

const actions = {
  login({ commit }, user) {
    return new Promise((resolve, reject) => {
      commit('auth_request')
      Axios({ url: `${BASE_URL}/auth/login`, data: user, method: 'POST' })
        .then(resp => {
          if (resp.data['mfa_challenge_token'] !== undefined) {
            const mfa_challenge_token = resp.data['mfa_challenge_token']
            localStorage.setItem('mfa_challenge_token', mfa_challenge_token)
            commit('auth_mfa_check')
            resolve(resp)
          } else {
            const access_token = resp.data['access_token']
            const refresh_token = resp.data['refresh_token']
            localStorage.setItem('access_token', access_token)
            localStorage.setItem('refresh_token', refresh_token)
            Axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
            commit('auth_success', { access_token, refresh_token })
            resolve(resp)
          }
        })
        .catch(err => {
          commit('auth_error')
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          reject(err)
        })
    })
  },
  loginWithSAML({ commit }, user) {
    return new Promise((resolve, reject) => {
      commit('auth_request')
      Axios({ url: `${BASE_URL}/auth/ssostart`, data: user, method: 'POST' })
        .then(resp => {
          resolve(resp)
        }).catch(err => {

          reject(err)
        })
    })
  },
  checkMFA({ commit }, user) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/auth/mfa`, data: user, method: 'POST' })
        .then(resp => {
          const access_token = resp.data['access_token']
          const refresh_token = resp.data['refresh_token']
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)
          Axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
          commit('auth_success', { access_token, refresh_token })
          resolve(resp)
        })
        .catch(err => {
          commit('auth_error')
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          reject(err)
        })
    })
  },
  forgotPassword({ commit }, username) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/auth/forgot_password`, data: username, method: 'POST' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  resetPassword({ commit }, { token, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/auth/reset_password/${token}`, data, method: 'POST' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  refresh_token({ commit }) {
    data = { 'refresh_token': this.$store.refresh_token }
    commit('refresh_request')
    Axios({ url: `${BASE_URL}/auth/refresh`, data: data, method: 'POST' })
      .then(resp => {
        const access_token = resp.data['access_token']
        const refresh_token = resp.data['refresh_token']
        const user = resp.data['user']
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        Axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
        commit('refresh_success', { access_token, refresh_token })
        resolve(resp)
      })
      .catch(err => {
        commit('refresh_error')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        reject(err)
      })
  },
  logout({ commit }) {
    return new Promise((resolve, reject) => {
      commit('logout')
      localStorage.removeItem('access_token')
      localStorage.removeItem('mfa_challenge_token')
      delete Axios.defaults.headers.common['Authorization']
      resolve()
    })
  },
  getMe({ commit }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/user/me`, method: 'GET' })
        .then(resp => {
          commit('add_start')
          commit('save_current_user', resp.data)
          commit('add_success')
          resolve(resp)
        })
        .catch(err => {
          commit('tags_error')
          reject(err)
        })
    })
  },
  getTags({ commit }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/tag`, method: 'GET' })
        .then(resp => {
          commit('save_tags', resp.data)
          resolve(resp)
        })
        .catch(err => {
          commit('tags_error')
          reject(err)
        })
    })
  },
  getDataTypes({ commit }, { organization }) {
    return new Promise((resolve, reject) => {

      let url = `${BASE_URL}/data_type`
      if (organization) {
        url += `?organization=${organization}`
      }
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_data_types', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getLists({ commit }, { data_type = [], organization = null, name__like = null, page = 1, page_size = 10 }) {
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/list?page=${page}&page_size=${page_size}`

      if (data_type.length > 0) {
        base_url += `&data_type=${data_type}`
      }

      if (organization) {
        base_url += `&organization=${organization}`
      }

      if (name__like) {
        base_url += `&name__like=${name__like}`
      }

      Axios({ url: base_url, method: 'GET' })
        .then(resp => {
          commit('save_lists', resp.data.lists)
          commit('save_pagination', resp.data.pagination)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createList({ commit }, data) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/list`, data: data, method: 'POST' })
        .then(resp => {
          commit('add_list', resp.data)
          commit('show_alert', { message: 'Successfully created list.', 'type': 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateList({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/list/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('save_list', resp.data)
          commit('show_alert', { message: 'Successfully updated list.', 'type': 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteList({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/list/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('remove_list', uuid)
          commit('show_alert', { message: 'Successfully deleted list.', 'type': 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  addItemToList({ commit }, { uuid, value }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/list/${uuid}/add_value`, data: value, method: 'PUT' })
        .then(resp => {
          commit('show_alert', { message: 'Successfully added value to list.', 'type': 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  removeItemFromList({ commit }, { uuid, value }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/list/${uuid}/remove_value`, data: value, method: 'PUT' })
        .then(resp => {
          commit('show_alert', { message: 'Successfully removed value from list.', 'type': 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getIntelListValues({ commit }, { page = 1, page_size = 25, list = [], value = [], data_type = [], from_poll = null, record_id = null, sort_by = 'created_at', list_name__like = null, sort_direction = 'desc', start = null, end = null, organization = null }) {
    return new Promise((resolve, reject) => {

      let url = `${BASE_URL}/list/values?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`

      if (list.length > 0) {
        url = url + `&list=${list}`
      }

      if (value.length > 0) {
        url = url + `&value=${value}`
      }

      if (data_type.length > 0) {
        url = url + `&data_type=${data_type}`
      }

      if (start && end) {
        url = url + `&start=${start}&end=${end}`
      }

      if (organization) {
        url = url + `&organization=${organization}`
      }

      if (record_id) {
        url = url + `&record_id=${record_id}`
      }

      if (list_name__like) {
        url = url + `&list_name__like=${list_name__like}`
      }

      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_list_values', resp.data.values)
          commit('save_pagination', resp.data.pagination)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getIntelListStats({ commit }, { list_name__like = null, value__like = null, top = 10, list = [], value = [], from_poll = null, record_id = null, data_type = [], metrics = ['list', 'value', 'data_type', 'from_poll'], start = null, end = null, organization = [] }) {
    commit('loading_status', true)
    return new Promise((resolve, reject) => {

      let url = `${BASE_URL}/list/stats?q=`

      if (list.length > 0) {
        url = url + `&list=${list}`
      }

      if (value.length > 0) {
        url = url + `&value=${value}`
      }

      if (data_type.length > 0) {
        url = url + `&data_type=${data_type}`
      }

      if (from_poll === true) {
        url = url + `&from_poll=true`
      }

      if (from_poll === false) {
        url = url + `&from_poll=false`
      }

      if (record_id) {
        url = url + `&record_id=${record_id}`
      }

      if (list_name__like) {
        url = url + `&list_name__like=${list_name__like}`
      }

      if (value__like) {
        url = url + `&value__like=${value__like}`
      }

      if (top) {
        url = url + `&top=${top}`
      }

      if (metrics) {
        url = url + `&metrics=${metrics}`
      }

      if (start && end) {
        url = url + `&start=${start}&end=${end}`
      }
      if (organization && organization.length > 0) {
        url = url + `&organization=${organization}`
      }

      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_list_stats', resp.data)
          commit('loading_status', false)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getDetectionMitreMapping({ commit }, { organization = null }) {
    return new Promise((resolve, reject) => {
      let url = `${BASE_URL}/mitre/detections`

      if (organization) {
        url = url + `?organization=${organization}`
      }

      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_detection_mitre_mapping', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getDetectionFilters({ commit }, { warnings = [], warnings__not = [], organization__not = [], status__not = [], tags__not = [], min_average_hits_per_day = 0, max_average_hits_per_day = 0, rule_type = [], name__like = null, description__like = null, query__like = null, organization = [], status = [], tags = [], techniques = [], tactics = [], repository = [], active = [], assess_rule = [], severity = [], repo_synced = true }) {
    commit('loading_status', true)
    return new Promise((resolve, reject) => {
      let url = `${BASE_URL}/detection/filters?tags=${tags}&techniques=${techniques}&tactics=${tactics}&organization=${organization}&repository=${repository}&status=${status}`

      url = url + `&repo_synced=${repo_synced}`

      if (tags__not.length > 0) {
        url = url + `&tags__not=${tags__not}`
      }

      if (active.length > 0) {
        url = url + `&active=${active}`
      }

      if (assess_rule.length > 0) {
        url = url + `&assess_rule=${assess_rule}`
      }

      if (severity.length > 0) {
        url = url + `&severity=${severity}`
      }

      if (name__like) {
        url = url + `&name__like=${name__like}`
      }

      if (description__like) {
        url = url + `&description__like=${description__like}`
      }

      if (query__like) {
        url = url + `&query__like=${query__like}`
      }

      if (rule_type.length > 0) {
        url = url + `&rule_type=${rule_type}`
      }

      if (max_average_hits_per_day > 0) {
        url = url + `&max_average_hits_per_day=${max_average_hits_per_day}`
      }

      if (min_average_hits_per_day > 0) {
        url = url + `&min_average_hits_per_day=${min_average_hits_per_day}`
      }

      if (warnings.length > 0) {
        url = url + `&warnings=${warnings}`
      }

      if (warnings__not.length > 0) {
        url = url + `&warnings__not=${warnings__not}`
      }

      if (status__not.length > 0) {
        url = url + `&status__not=${status__not}`
      }

      if (organization__not.length > 0) {
        url = url + `&organization__not=${organization__not}`
      }

      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('loading_status', false)
          commit('update_detection_filters', resp.data)
          resolve(resp)
        })
        .catch(err => {
          commit('loading_status', false)
          reject(err)
        })
    })
  },
  getDetectionsByFilter({ commit }, { warnings = [], warnings__not = [], organization__not = [], status__not = [], tags__not = [], min_average_hits_per_day = 0, max_average_hits_per_day = 0, rule_type = [], name__like = null, description__like = null, query__like = null, page = 1, page_size = 10000, sort_by = "created_at", sort_direction = "asc", status = [], repository = [], phase_names = [], techniques = [], tactics = [], tags = [], active = [], assess_rule = [], severity = [], save = true, organization = null, repo_synced = true }) {
    commit('loading_status', true)
    return new Promise((resolve, reject) => {

      if (max_average_hits_per_day == 0) {
        max_average_hits_per_day = '0'
      }

      if (min_average_hits_per_day == 0) {
        min_average_hits_per_day = '0'
      }

      let url = `${BASE_URL}/detection/select_by_filter?max_average_hits_per_day=${max_average_hits_per_day}&min_average_hits_per_day=${min_average_hits_per_day}`


      if (techniques.length > 0) {
        url = url + `&techniques=${techniques}`
      }

      if (tactics.length > 0) {
        url = url + `&tactics=${tactics}`
      }

      if (organization) {
        url = url + `&organization=${organization}`
      }

      if (phase_names.length > 0) {
        url = url + `&phase_names=${phase_names}`
      }

      if (active.length > 0) {
        url = url + `&active=${active}`
      }

      if (assess_rule.length > 0) {
        url = url + `&assess_rule=${assess_rule}`
      }

      if (tags.length > 0) {
        url = url + `&tags=${tags}`
      }

      if (tags__not.length > 0) {
        url = url + `&tags__not=${tags__not}`
      }

      if (name__like) {
        url = url + `&name__like=${name__like}`
      }

      if (description__like) {
        url = url + `&description__like=${description__like}`
      }

      if (query__like) {
        url = url + `&query__like=${query__like}`
      }

      if (rule_type.length > 0) {
        url = url + `&rule_type=${rule_type}`
      }

      if (warnings.length > 0) {
        url = url + `&warnings=${warnings}`
      }

      if (warnings__not.length > 0) {
        url = url + `&warnings__not=${warnings__not}`
      }

      if (status__not.length > 0) {
        url = url + `&status__not=${status__not}`
      }

      if (organization__not.length > 0) {
        url = url + `&organization__not=${organization__not}`
      }

      if (severity.length > 0) {

        url = url + `&severity=${severity}`
      }

      url = url + `&repo_synced=${repo_synced}`


      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('loading_status', false)
          resolve(resp)
        })
        .catch(err => {
          commit('loading_status', false)
          reject(err)
        })
    })
  },
  getDetections({ commit }, { warnings = [], warnings__not = [], organization__not = [], status__not = [], tags__not = [], min_average_hits_per_day = 0, max_average_hits_per_day = 0, rule_type = [], name__like = null, description__like = null, query__like = null, page = 1, page_size = 10000, sort_by = "created_at", sort_direction = "asc", status = [], repository = [], phase_names = [], techniques = [], tactics = [], tags = [], active = [], assess_rule = [], severity = [], save = true, organization = null, repo_synced = true }) {
    commit('loading_status', true)
    return new Promise((resolve, reject) => {
      let url = `${BASE_URL}/detection?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}&repository=${repository}&status=${status}`

      if (techniques.length > 0) {
        url = url + `&techniques=${techniques}`
      }

      if (tactics.length > 0) {
        url = url + `&tactics=${tactics}`
      }

      if (organization) {
        url = url + `&organization=${organization}`
      }

      if (phase_names.length > 0) {
        url = url + `&phase_names=${phase_names}`
      }

      if (active.length > 0) {
        url = url + `&active=${active}`
      }

      if (assess_rule.length > 0) {
        url = url + `&assess_rule=${assess_rule}`
      }

      if (severity.length > 0) {

        url = url + `&severity=${severity}`
      }

      if (tags.length > 0) {
        url = url + `&tags=${tags}`
      }

      if (tags__not.length > 0) {
        url = url + `&tags__not=${tags__not}`
      }

      if (name__like) {
        url = url + `&name__like=${name__like}`
      }

      if (description__like) {
        url = url + `&description__like=${description__like}`
      }

      if (query__like) {
        url = url + `&query__like=${query__like}`
      }

      if (rule_type.length > 0) {
        url = url + `&rule_type=${rule_type}`
      }

      if (max_average_hits_per_day > 0) {
        url = url + `&max_average_hits_per_day=${max_average_hits_per_day}`
      }

      if (min_average_hits_per_day > 0) {
        url = url + `&min_average_hits_per_day=${min_average_hits_per_day}`
      }

      if (warnings.length > 0) {
        url = url + `&warnings=${warnings}`
      }

      if (warnings__not.length > 0) {
        url = url + `&warnings__not=${warnings__not}`
      }

      if (status__not.length > 0) {
        url = url + `&status__not=${status__not}`
      }

      if (organization__not.length > 0) {
        url = url + `&organization__not=${organization__not}`
      }

      url = url + `&repo_synced=${repo_synced}`

      Axios({ url: url, method: 'GET' })
        .then(resp => {
          if (save) {
            commit('save_detections', resp.data.detections)
            commit('save_pagination', resp.data.pagination)
          }
          commit('loading_status', false)
          resolve(resp)
        })
        .catch(err => {
          commit('loading_status', false)
          reject(err)

        })
    })
  },
  flagDetectionAssess({ commit }, { uuid }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection/${uuid}/assess`, method: 'PUT' })
        .then(resp => {
          commit('save_detection', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createDetection({ commit }, detection) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection`, data: detection, method: 'POST' })
        .then(resp => {
          commit('add_detection', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteDetection({ commit }, { uuid }) {
    commit('loading_status', true)
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('remove_detection', uuid)
          commit('loading_status', false)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getDetectionHits({ commit }, { uuid }) {
    commit('loading_status', true)
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection/${uuid}/hits`, method: 'GET' })
        .then(resp => {
          commit('save_detection_hits', resp.data.events)
          commit('loading_status', false)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createFieldTemplate({ commit }, field_template) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/field_template`, data: field_template, method: 'POST' })
        .then(resp => {
          commit('save_field_template', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateFieldTemplate({ commit }, { uuid, template }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/field_template/${uuid}`, data: template, method: 'PUT' })
        .then(resp => {
          commit('save_field_template', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getFieldTemplates({ commit }, { page = 1, page_size = 10, sort_by = "created_at", sort_direction = "asc", organization = null }) {
    return new Promise((resolve, reject) => {
      let url = `${BASE_URL}/field_template?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`
      if (organization) {
        url += `&organization=${organization}`
      }
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_field_templates', resp.data.templates)
          commit('save_pagination', resp.data.pagination)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getInputs({ commit }, { page = 1, page_size = 10, sort_by = "created_at", sort_direction = "asc", organization = null, mitre_data_sources = [] }) {
    return new Promise((resolve, reject) => {
      let url = `${BASE_URL}/input?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`
      if (organization) {
        url += `&organization=${organization}`
      }
      if (mitre_data_sources.length > 0) {
        url += `&mitre_data_sources=${mitre_data_sources}`
      }
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_inputs', resp.data.inputs)
          commit('save_pagination', resp.data.pagination)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getAgents({ commit }, { page = 1, page_size = 10, sort_by = "created_at", sort_direction = "asc", filter_query = null  }) {

    let url = `${BASE_URL}/agent?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`

    if (filter_query) {
      url += `&filter_query=${filter_query}`
    }

    return new Promise((resolve, reject) => {
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_agents', resp.data.agents)
          commit('save_pagination', resp.data.pagination)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getAgentGroups({ commit }, { page = 1, page_size = 10, sort_by = "created_at", sort_direction = "asc" }) {

    let url = `${BASE_URL}/agent_group?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`
    return new Promise((resolve, reject) => {
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_agent_groups', resp.data.groups)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getAgentGroup({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/agent_group/${uuid}`, method: 'GET' })
        .then(resp => {
          commit('save_agent_group', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteAgent({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/agent/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('remove_agent', uuid)
          commit('show_alert', { message: `Successfully deleted agent.`, 'type': 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateAgent({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/agent/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_agent', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateAgentGroup({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/agent_group/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_agent_group', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getPairingToken({ commit }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/agent/pair_token`, method: 'GET' })
        .then(resp => {
          commit('save_pairing_token', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createInput({ commit }, input) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/input`, data: input, method: 'POST' })
        .then(resp => {
          commit('add_input', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createAgentGroup({ commit }, agent_group) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/agent_group`, data: agent_group, method: 'POST' })
        .then(resp => {
          commit('add_agent_group', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getDetection({ commit }, { uuid, event = null }) {
    return new Promise((resolve, reject) => {
      let url = `${BASE_URL}/detection/${uuid}`

      if (event) {
        url += `?event=${event}`
      }

      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_detection', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateDetection({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_detection', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getInputIndexFields({ commit }, { uuid, limit = 25, organization = null, name__like = null }) {
    return new Promise((resolve, reject) => {

      let url = `${BASE_URL}/input/${uuid}/index_fields?limit=${limit}`

      if (organization) {
        url += `&organization=${organization}`
      }

      if (name__like) {
        url += `&name__like=${name__like}`
      }

      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_index_fields', resp.data.index_fields)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteInput({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/input/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('remove_input', uuid)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getInput({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/input/${uuid}`, method: 'GET' })
        .then(resp => {
          commit('save_input', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateInput({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/input/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_input', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getAgent({ commit }, {uuid, include_host_info = false}) {
    return new Promise((resolve, reject) => {
      let url = `${BASE_URL}/agent/${uuid}`

      if (include_host_info) {
        url += `?include_host_info=true`
      }

      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_agent', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  setAgentGroups({ commit }, { uuid, groups }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/agent/${uuid}`, data: groups, method: 'PUT' })
        .then(resp => {
          commit('save_agent_groups', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  setAgentGroupInputs({ commit }, { uuid, inputs }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/agent_group/${uuid}`, data: inputs, method: 'PUT' })
        .then(resp => {
          //commit('save_inputs', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  setAgentInputs({ commit }, { uuid, inputs }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/agent/${uuid}`, data: inputs, method: 'PUT' })
        .then(resp => {
          commit('save_inputs', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  addTagsToInput({ commit }, postData) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/input/${postData.uuid}/bulktag`, data: postData.data, method: 'POST' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getPublicKey({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/credential/public_key/${uuid}`, method: 'GET' })
      .then(resp => {
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCredentialList({ commit }, { organization }) {
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/credential`

      if (organization) {
        base_url += `?organization=${organization}`
      }

      Axios({ url: base_url, method: 'GET' })
        .then(resp => {
          let credentials = []
          resp.data.credentials.forEach(cred => credentials.push({ 'value': cred.uuid, 'label': cred.name + " - " + cred.description }))
          commit('creds_success', credentials)
          commit('save_credentials', resp.data.credentials)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getInputList({ commit }, { organization = null, name = null }) {
    return new Promise((resolve, reject) => {

      let url = `${BASE_URL}/input`
      if (organization) {
        url += `?organization=${organization}`
      }
      if (name) {
        url += `&name=${name}`
      }
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          let credentials = []
          commit('save_inputs_list', resp.data.inputs)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getDashboardMetrics({ commit }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/dashboard`, method: 'GET' })
        .then(resp => {
          commit('save_dashboard_metrics', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createNotificationChannel({ commit }, { data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/notification/channel`, data: data, method: 'POST' })
        .then(resp => {
          commit('save_notification_channel', resp.data)
          resolve(resp)
        }).catch(err => {
          reject(err)
        })
    })
  },
  editNotificationChannel({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/notification/channel/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_notification_channel', resp.data)
          resolve(resp)
        }).catch(err => {
          reject(err)
        })
    })
  },
  getNotificationChannels({ commit }, { page = 1, page_size = 10, sort_by = "created_at", sort_direction = "asc", organization = null, name__like = null }) {
    return new Promise((resolve, reject) => {

      let url = `${BASE_URL}/notification/channel?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`

      if (organization) {
        url += `&organization=${organization}`
      }

      if (name__like) {
        url += `&name__like=${name__like}`
      }

      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_notification_channels', resp.data.channels)
          commit('save_pagination', resp.data.pagination)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getCredentials({ commit }, { page = 1, page_size = 1000, sort_by = "created_at", sort_direction = "asc", name__like = null, organization = null }) {
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/credential`
      let params = []

      if (page) params.push(`page=${page}`);
      if (page_size) params.push(`page_size=${page_size}`);
      if (sort_by) params.push(`sort_by=${sort_by}`);
      if (sort_direction) params.push(`sort_direction=${sort_direction}`);
      if (name__like) params.push(`name__like=${name__like}`);
      if (organization) params.push(`organization=${organization}`);
      if (params.length > 0) {
        base_url += `?${params.join('&')}`
      }

      Axios({ url: base_url, method: 'GET' })
        .then(resp => {
          commit('save_credentials', resp.data.credentials)
          commit('save_pagination', resp.data.pagination)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getCredential({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/credential/${uuid}`, method: 'GET' })
        .then(resp => {
          commit('save_credential', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteCredential({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/credential/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('remove_credential', uuid)
          commit('show_alert', { 'message': 'Successfully deleted credential', 'type': 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateCredential({ commit }, { uuid, credential }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/credential/${uuid}`, data: credential, method: 'PUT' })
        .then(resp => {
          commit('update_credential', resp.data)
          commit('show_alert', { 'message': 'Successfully updated credential', 'type': 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createCredential({ commit }, credential) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/credential/encrypt`, data: credential, method: 'POST' })
        .then(resp => {
          commit('add_credential', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getPlaybooks({ commit }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/playbook`, method: 'GET' })
        .then(resp => {
          commit('save_playbooks', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getCaseFiles({ commit }, { uuid, page = 1, page_size = 25 }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case/${uuid}/files?page=${page}&page_size=${page_size}` })
        .then(resp => {
          commit('add_start')
          commit('save_case_files', resp.data.files)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getRelatedEvents({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event/${uuid}/new_related_events`, method: 'GET' })
        .then(resp => {
          commit('save_related_events', resp.data.events)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getObservableNetwork({ commit }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/observable/network`, method: 'GET' })
        .then(resp => {
          commit('save_network_data', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getBulkEvents({ commit }, { signature = null, status = [], severity = [], source = [], tags = [], title = [], observables = [], start = null, end = null, organization = [], title__like = null, event_rule = [] }) {
    return new Promise((resolve, reject) => {

      let url = `${BASE_URL}/event/bulk_select_all?q=`

      if (signature) {
        url = url + `&signature=${signature}`
      }
      if (status) {
        url = url + `&status=${status}`
      }
      if (severity.length > 0) {
        url = url + `&severity=${severity}`
      }
      if (tags.length > 0) {
        url = url + `&tags=${tags}`
      }
      if (title.length > 0) {
        url = url + `&title=${title}`
      }
      if (source.length > 0) {
        url = url + `&source=${source}`
      }
      if (observables.length > 0) {
        url = url + `&observables=${observables}`
      }
      if (start && end) {
        url = url + `&start=${start}&end=${end}`
      }
      if (organization && organization.length > 0) {
        url = url + `&organization=${organization}`
      }
      if (title__like) {
        url = url + `&title__like=${title__like}`
      }

      if (event_rule && event_rule.length > 0) {
        url = url + `&event_rule=${event_rule}`
      }

      Axios({ url: url, method: 'GET' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getEventExport({ commit }, report_params) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event/export`, data: report_params, method: 'POST', responseType:'blob' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getEventComments({ commit }, {uuid, page = 1, page_size = 25}) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event/${uuid}/comment?page=${page}&page_size=${page_size}`, method: 'GET' })
        .then(resp => {
          commit('save_event_comments', resp.data.comments)
          commit('save_event_comments_pagination', resp.data.pagination)
          resolve(resp)
        }).catch(err => {
          reject(err)
        })
    })
  },
  getEventStats({ commit }, { title__like = null, signature = null, status = [], severity = [], source = [], tags = [], title = [], observables = [], top = null, metrics = ['title', 'observable', 'source', 'tag', 'status', 'severity', 'data_type', 'organization', 'event_rule', 'signature'], start = null, end = null, organization = [], event_rules = [] }) {
    commit('loading_status', true)

    if(this.state.eventFilterCancelToken) {
      this.state.eventFilterCancelToken.cancel('Operation canceled due to new request.')
      
    }
      
    //this.state.cancelToken = Axios.CancelToken
    this.state.eventFilterCancelToken = this.state.cancelToken.source()


    return new Promise((resolve, reject) => {

      let url = `${BASE_URL}/event/stats?q=`

      if (signature) {
        url = url + `&signature=${signature}`
      }
      if (status) {
        url = url + `&status=${status}`
      }
      if (severity.length > 0) {
        url = url + `&severity=${severity}`
      }
      if (tags.length > 0) {
        url = url + `&tags=${tags}`
      }
      if (title.length > 0) {
        url = url + `&title=${title}`
      }
      if (source.length > 0) {
        url = url + `&source=${source}`
      }
      if (observables.length > 0) {
        url = url + `&observables=${observables}`
      }
      if (top) {
        url = url + `&top=${top}`
      }
      if (metrics) {
        url = url + `&metrics=${metrics}`
      }
      if (start && end) {
        url = url + `&start=${start}&end=${end}`
      }
      if (organization && organization.length > 0) {
        url = url + `&organization=${organization}`
      }
      if (event_rules && event_rules.length > 0) {
        url = url + `&event_rule=${event_rules}`
      }
      if (title__like) {
        url = url + `&title__like=${title__like}`
      }

      Axios({ url: url, method: 'GET', cancelToken: this.state.eventFilterCancelToken.token })
        .then(resp => {
          commit('save_event_stats', resp.data)
          resolve(resp)
        })
        .catch(function(thrown) {
          if (Axios.isCancel(thrown)) {
            console.log('Request canceled', thrown.message);
          } else {
            reject(thrown)
          }
        })
    })
  },
  getCaseEvents({ commit }, { uuid, title__like = null, signature = null, status = [], search, rql, severity = [], page, source = [], tags = [], title = [], observables = [], page_size = 25, sort_by = 'created_at', grouped = true, fields = '', sort_direction = 'desc', start = null, end = null, organization = null }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event/case_events/${uuid}`, method: 'GET' })
        .then(resp => {
          commit('save_events', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getEvents({ commit }, { title__like = null, signature = null, case_uuid, status = [], search, rql, severity = [], page, source = [], tags = [], title = [], observables = [], page_size = 25, sort_by = 'original_date', grouped = true, fields = '', sort_direction = 'desc', start = null, end = null, organization = null, event_rules = null}) {

    if(this.state.eventSearchCancelToken) {
      this.state.eventSearchCancelToken.cancel('Operation canceled due to new request.')
      
    }
      
    //this.state.cancelToken = Axios.CancelToken
    this.state.eventSearchCancelToken = this.state.cancelToken.source()

    return new Promise((resolve, reject) => {

      let url = `${BASE_URL}/event?grouped=${grouped}&sort_by=${sort_by}&sort_direction=${sort_direction}`

      if (signature) {
        url = url + `&signature=${signature}`
      }
      if (status) {
        url = url + `&status=${status}`
      }
      if (case_uuid) {
        url = url + `&case_uuid=${case_uuid}`
      }
      if (search) {
        url = url + `&search=${search}`
      }
      if (rql) {
        url = url + `&rql=${rql}`
      }
      if (severity.length > 0) {
        url = url + `&severity=${severity}`
      }
      if (page) {
        url = url + `&page=${page}`
      }
      if (page_size) {
        url = url + `&page_size=${page_size}`
      }
      if (tags.length > 0) {
        url = url + `&tags=${tags}`
      }
      if (observables.length > 0) {
        url = url + `&observables=${observables}`
      }
      if (title.length > 0) {
        url = url + `&title=${title}`
      }

      if (source.length > 0) {
        url = url + `&source=${source}`
      }

      if (organization && organization.length > 0) {
        url = url + `&organization=${organization}`
      }

      if (event_rules && event_rules.length > 0) {
        url = url + `&event_rule=${event_rules}`
      }

      if (start && end) {
        url = url + `&start=${start}&end=${end}`
      }

      if (title__like) {
        url = url + `&title__like=${title__like}`
      }

      Axios({ url: url, method: 'GET', headers: { 'X-Fields': fields }, cancelToken: this.state.eventSearchCancelToken.token })
        .then(resp => {
          commit('add_start')
          commit('save_events', resp.data.events)
          commit('loading_status', false)
          resolve(resp)
        })
        .catch(function(thrown) {
          if (Axios.isCancel(thrown)) {
            console.log('Request canceled', thrown.message);
            commit('loading_status', false)
          } else {
            reject(thrown)
          }
        })
    })
  },
  getEvent({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event/${uuid}`, method: 'GET' })
        .then(resp => {
          commit('save_event', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getEventIndex({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event/${uuid}/indexed`, method: 'GET' })
        .then(resp => {
          //commit('save_event_index', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateEvent({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('save_event', resp.data)
          commit('show_alert', { message: `Successfully updated Event.`, 'type': 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  acknowledgeEvent({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event/${uuid}/acknowledge`, method: 'PUT' })
        .then(resp => {
          commit('save_event', resp.data)
          commit('show_alert', { message: `Successfully acknowledged Event.`, 'type': 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  acknowledgeEventBySignature({ commit }, { uuid, signature }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event/${uuid}/acknowledge?signature=${signature}`, method: 'PUT' })
        .then(resp => {
          commit('save_event', resp.data)
          commit('show_alert', { message: `Successfully acknowledged Event.`, 'type': 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  unacknowledgeEventBySignature({ commit }, { uuid, signature }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event/${uuid}/unacknowledge?signature=${signature}`, method: 'PUT' })
        .then(resp => {
          commit('save_event', resp.data)
          commit('show_alert', { message: `Successfully unacknowledged Event.`, 'type': 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  unacknowledgeEvent({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event/${uuid}/unacknowledge`, method: 'PUT' })
        .then(resp => {
          commit('save_event', resp.data)
          commit('show_alert', { message: `Successfully unacknowledge Event.`, 'type': 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  dismissEventsByFilter({ commit }, data) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event/dismiss_by_filter`, data: data, method: 'PUT' })
        .then(resp => {
          commit('save_multiple_events', resp.data)
          //commit('add_toast', {message:`Dismiss task submitted.`, header:'Bulk Dismiss', color: 'success', key: resp.data.task_id, refresh: false})
          //commit('add_task', resp.data.task_id)
          resolve(resp)
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
    })
  },
  dismissEvents({ commit }, data) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event/bulk_dismiss`, data: data, method: 'PUT' })
        .then(resp => {
          commit('save_multiple_events', resp.data)
          //commit('show_alert', {message: `Successfully updated ${data.events.length} Events.`, 'type': 'success'})
          commit('add_toast', { message: `Dismiss task submitted.`, header: 'Bulk Dismiss', color: 'success', key: resp.data.task_id, refresh: false })
          commit('add_task', resp.data.task_id)
          resolve(resp)
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
    })
  },
  getEventViews({ commit }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event_view`, method: 'GET' })
        .then(resp => {
          commit('save_event_views', resp.data['views'])
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createEventView({ commit }, data) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event_view`, data: data, method: 'POST' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateEventView({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event_view/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createEventComment({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event/${uuid}/comment`, data: data, method: 'POST' })
        .then(resp => {
          commit('add_event_comment', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createEventRule({ commit }, rule) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event_rule`, data: rule, method: 'POST' })
        .then(resp => {
          commit('save_event_rule', resp.data)
          commit('show_alert', { message: 'Successfully created the Event Rule.', 'type': 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  editEventRule({ commit }, { uuid, rule }) {
    commit('loading_status', true)
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event_rule/${uuid}`, data: rule, method: 'PUT' })
        .then(resp => {
          commit('update_event_rule', resp.data)
          commit('show_alert', { message: 'Successfully updated the Event Rule.', 'type': 'success' })
          commit('loading_status', false)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getPlugins({ commit }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/plugin`, method: 'GET' })
        .then(resp => {
          commit('save_plugins', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getPlugin({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/plugin/${uuid}`, method: 'GET' })
        .then(resp => {
          commit('save_plugin', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  uploadPlugin({ commit }, formData) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/plugin/upload`, data: formData, method: 'POST', config: { headers: { 'Content-Type': 'multipart/form-data' } } })
        .then(resp => resp.data)
        .then(resp => resp.map(plugin => Object.assign({}, plugin, { name: plugin.name })))
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getPluginConfig({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/plugin_config/${uuid}`, method: 'GET' })
        .then(resp => {
          commit('save_plugin_config', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getPluginConfigs({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/plugin_config`, method: 'GET' })
        .then(resp => {
          commit('save_plugin_configs', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createPluginConfig({ commit }, config) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/plugin_config`, data: config, method: 'POST' })
        .then(resp => {
          commit('add_plugin_config', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getOrganization({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/organization/${uuid}`, method: 'GET' })
        .then(resp => {
          commit('save_organization', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateOrganization({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/organization/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_organization', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createOrganization({ commit }, organization) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/organization`, data: organization, method: 'POST' })
        .then(resp => {
          commit('add_organization', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getOrganizations({ commit }, { page = 1, page_size = 100, sort_by = "created_at", sort_direction = "asc" }) {
    return new Promise((resolve, reject) => {
      let base_url = `${BASE_URL}/organization?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`
      Axios({ url: base_url, method: 'GET' })
        .then(resp => {
          commit('save_organizations', resp.data.organizations)
          commit('save_pagination', resp.data.pagination)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getUsers({ commit }, { page = 1, page_size = 10, organization = null, sort_by = "created_at", sort_direction = "asc" }) {
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/user?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`
      if (organization) {
        base_url += `&organization=${organization}`
      }
      Axios({ url: base_url, method: 'GET' })
        .then(resp => {
          commit('save_users', resp.data.users)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getGroups({ commit }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/user_group`, method: 'GET' })
        .then(resp => {
          commit('save_users', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getUserGroupsByName({ commit }, name) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/user_groups?name={name}`, method: 'GET' })
        .then(resp => {
          commit('save_user_groups', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  unlockUser({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/user/${uuid}/unlock`, method: 'PUT' })
        .then(resp => {
          commit('save_user', resp.data.user)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateUser({ commit }, { uuid, user }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/user/${uuid}`, data: user, method: 'PUT' })
        .then(resp => {
          commit('save_user', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateUserPassword({ commit }, data) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/user/set_password`, data: data, method: 'PUT' })
        .then(resp => {
          commit('save_user', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteUser({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/user/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('remove_user', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getUser({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/user/${uuid}`, method: 'GET' })
        .then(resp => {
          commit('save_user', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createUser({ commit }, user) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/user`, data: user, method: 'POST' })
        .then(resp => {
          commit('add_user', resp.data.user)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getRoles({ commit }, { organization = null, page = 1, page_size = 10, sort_by = "created_at", sort_direction = "asc" }) {

    let url = `${BASE_URL}/role?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`

    if (organization) {
      url += `&organization=${organization}`
    }

    return new Promise((resolve, reject) => {
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_roles', resp.data.roles)
          commit('save_pagination', resp.data.pagination)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createPlaybook({ commit }, playbook) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/playbook`, data: playbook, method: 'POST' })
        .then(resp => {
          commit('add_playbook', playbook)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getPlaybook({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/playbook/${uuid}`, method: 'GET' })
        .then(resp => {
          commit('save_playbook', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  addTagsToPlaybook({ commit }, postData) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/playbook/${postData.uuid}/bulktag`, data: postData.data, method: 'POST' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getCaseTemplates({ commit }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case_template`, method: 'GET' })
        .then(resp => {
          commit('save_case_templates', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createCaseTemplate({ commit }, data) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case_template`, data: data, method: 'POST' })
        .then(resp => {
          commit('add_case_template', data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateCaseTemplate({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case_template/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_case_template', data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getCaseTemplateList({ commit }, { title, organization }) {
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/case_template?title=${title}`

      if (organization) {
        base_url += `&organization=${organization}`
      }

      Axios({ url: base_url, method: 'GET', headers: { 'X-Fields': 'uuid,title,description,tlp,severity,tags,task_count' } })
        .then(resp => {
          commit('save_case_template_list', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getCases({ commit }, { status = [], search = [], severity = [], tag = [], owner = [], organization = [], close_reason = [], my_cases = false, my_tasks = false, page = 1, page_size = 25, start = null, end = null, sort_by = "created_at", sort_direction = "asc", escalated = null, title__like = null, observables = [], comments__like = null, description__like = null }) {
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/case?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`

      if (title__like) {
        base_url += `&title__like=${title__like}`
      }

      if (comments__like) {
        base_url += `&comments__like=${comments__like}`
      }

      if (description__like) {
        base_url += `&description__like=${description__like}`
      }

      if (observables.length > 0) {
        base_url += `&observables=${observables.join(',')}`
      }

      if (status.length > 0) {
        base_url += `&status=${status}`
      }

      if (search.length > 0) {
        base_url += `&search=${search}`
      }

      if (severity.length > 0) {
        base_url += `&severity=${severity}`
      }

      if (owner.length > 0) {
        base_url += `&owner=${owner}`
      }

      if (tag.length > 0) {
        base_url += `&tag=${tag}`
      }

      if (my_tasks) {
        base_url += `&my_tasks=${my_tasks}`
      }

      if (my_cases) {
        base_url += `&my_cases=${my_cases}`
      }

      if (organization.length > 0) {
        base_url += `&organization=${organization}`
      }

      if (close_reason.length > 0) {
        base_url += `&close_reason=${close_reason}`
      }

      if (start && end) {
        base_url += `&start=${start}&end=${end}`
      }

      if (escalated != null) {
        base_url += `&escalated=${escalated}`
      }

      Axios({ url: base_url, method: 'GET', headers: { 'Content-Type': 'application/json' } })
        .then(resp => {
          commit('save_cases', resp.data.cases)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getCaseStats({ commit }, { status = [], severity = [], tags = [], title = [], close_reason = [], owner = [], top = null, my_cases = false, metrics = ['title', 'tag', 'status', 'severity', 'close_reason', 'organization', 'escalated'], start = null, end = null, organization = [], escalated = null }) {
    return new Promise((resolve, reject) => {

      let url = `${BASE_URL}/case/stats?q=`

      if (status) {
        url = url + `&status=${status}`
      }
      if (severity.length > 0) {
        url = url + `&severity=${severity}`
      }
      if (tags.length > 0) {
        url = url + `&tags=${tags}`
      }
      if (title.length > 0) {
        url = url + `&title=${title}`
      }
      if (top) {
        url = url + `&top=${top}`
      }
      if (metrics) {
        url = url + `&metrics=${metrics}`
      }
      if (start && end) {
        url = url + `&start=${start}&end=${end}`
      }
      if (organization && organization.length > 0) {
        url = url + `&organization=${organization}`
      }
      if (close_reason.length > 0) {
        url = url + `&close_reason=${close_reason}`
      }
      if (owner.length > 0) {
        url += `&owner=${owner}`
      }
      if (my_cases) {
        url += `&my_cases=${my_cases}`
      }
      if (escalated != null) {
        url += `&escalated=${escalated}`
      }

      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_case_stats', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getRelatedCases({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case/${uuid}/relate_cases`, method: 'GET' })
        .then(resp => {
          commit('save_related_cases', resp.data.related_cases)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  relateCases({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case/${uuid}/relate_cases`, data: data, method: 'PUT' })
        .then(resp => {
          commit('save_related_cases', resp.data.related_cases)
          commit('show_alert', { message: 'Successfully linked cases.', type: 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  unlinkCases({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case/${uuid}/relate_cases`, data: data, method: 'DELETE' })
        .then(resp => {
          commit('save_related_cases', resp.data.related_cases)
          commit('show_alert', { message: 'Successfully unlinked cases.', type: 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getCaseObservablesFromEvents({ commit }, { uuid, page = 1, page_size = 25 }) {
    return new Promise((resolve, reject) => {
      let base_url = `${BASE_URL}/event/observables_by_case/${uuid}?page=${page}&page_size=${page_size}`

      Axios({ url: base_url, method: 'GET' }).then(resp => {
        commit('save_observables', resp.data.observables)
        resolve(resp)
      }).catch(err => {
        reject(err)
      })
    })
  },
  getCaseObservables({ commit }, { uuid, page = 1, page_size = 25, observable = [], dataType = [], search = [], tags = [] }) {
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/case/${uuid}/observables?page=${page}&page_size=${page_size}`

      if (observable.length > 0) {
        base_url += `&observables=${observables}`
      }

      if (dataType.length > 0) {
        base_url += `&dataType=${dataType}`
      }

      if (search.length > 0) {
        base_url += `&search=${search}`
      }

      if (tags.length > 0) {
        base_url += `&tags=${tag}`
      }

      Axios({ url: base_url, method: 'GET' })
        .then(resp => {
          commit('save_observables', resp.data.observables)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateObservable({ commit }, { uuid, observable_value, data }) {
    return new Promise((resolve, reject) => {
      observable_value = Buffer.from(observable_value).toString('base64')
      Axios({ url: `${BASE_URL}/case/${uuid}/observables/${observable_value}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_observable', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateEventObservable({ commit }, { uuid, observable_value, data }) {
    return new Promise((resolve, reject) => {
      observable_value = Buffer.from(observable_value).toString('base64')
      Axios({ url: `${BASE_URL}/event/${uuid}/observables/${observable_value}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_observable', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  bulkUpdateObservables({ commit }, data) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/observable/_bulk`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_observables', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getCloseReasons({ commit }, { organization = null }) {
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/close_reason`

      if (organization) {
        base_url += `?organization=${organization}`
      }

      Axios({ url: base_url, method: 'GET' })
        .then(resp => {
          commit('save_close_reasons', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getCasesByTitle({ commit }, { title, organization = null, fields = 'uuid,title,id,event_count,owner,severity' }) {
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/case?title__like=${title}`

      if (organization) {
        base_url += `&organization=${organization}`
      }

      Axios({ url: base_url, method: 'GET' })
        .then(resp => {
          commit('save_cases', resp.data.cases)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getCaseComments({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case_comment?case_uuid=${uuid}`, method: 'GET' })
        .then(resp => {
          commit('save_comments', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getCaseHistory({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case_history?case_uuid=${uuid}`, method: 'GET' })
        .then(resp => {
          commit('save_case_history', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getCaseTasks({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case_task?case_uuid=${uuid}`, method: 'GET' })
        .then(resp => {
          commit('save_case_tasks', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  addTaskNote({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case_task/${uuid}/add_note`, data: data, method: 'POST' })
        .then(resp => {
          commit('add_case_task_note', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getTaskNotes({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/task_note?task_uuid=${uuid}`, method: 'GET' })
        .then(resp => {
          commit('save_case_task_notes', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getCaseStatus({ commit }, { organization = null }) {

    let base_url = `${BASE_URL}/case_status`

    if (organization) {
      base_url += `?organization=${organization}`
    }

    return new Promise((resolve, reject) => {
      Axios({ url: base_url, method: 'GET' })
        .then(resp => {
          commit('save_case_status', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getUsersByName({ commit }, { username, organization = null }) {
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/user?username=${username}`

      if (organization) {
        base_url += `&organization=${organization}`
      }

      Axios({ url: base_url, method: 'GET' })
        .then(resp => {
          commit('save_users', resp.data.users)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getGroupsByName({ commit }, name) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/user_group?name=${name}`, method: 'GET' })
        .then(resp => {
          commit('save_user_groups', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getCase({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case/${uuid}`, method: 'GET' })
        .then(resp => {
          commit('save_case', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createCase({ commit }, data) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case`, data: data, method: 'POST' })
        .then(resp => {
          commit('add_case', data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createCaseTask({ commit }, data) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case_task`, data: data, method: 'POST' })
        .then(resp => {
          commit('add_case_task', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  addEventsToCase({ commit }, { uuid, include_related_events = false, events }) {

    let data = {
      'events': events,
      'include_related_events': include_related_events
    }

    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case/${uuid}/add_events`, data: data, method: 'PUT' })
        .then(resp => {
          commit('save_case', resp.data.case)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateComment({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case_comment/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_case_comment', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateCaseTask({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case_task/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_case_task', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteCaseTask({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case_task/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('remove_case_task', uuid)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteCaseTemplate({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case_template/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('remove_case_template', uuid)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateCase({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_case', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createCaseComment({ commit }, data) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case_comment`, data: data, method: 'POST' })
        .then(resp => {
          commit('add_case_comment', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteAgent({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/agent/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('remove_agent', uuid)
          commit('show_alert', { message: 'Successfully deleted the agent.', 'type': 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteAgentGroup({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/agent_group/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('remove_agent_group', uuid)
          commit('show_alert', { message: 'Successfully deleted the agent group.', 'type': 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteEvent({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('remove_event', uuid)
          commit('show_alert', { message: 'Successfully deleted the event.', 'type': 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteEvents({ commit }, events) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event/bulk_delete`, data: { events: events }, method: 'DELETE' })
        .then(resp => {
          commit('remove_events', events)
          commit('show_alert', { message: 'Successfully deleted the events.', 'type': 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteCase({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('remove_case', uuid)
          commit('show_alert', { message: 'Successfully deleted the case.', 'type': 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteCaseComment({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case_comment/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('remove_comment', uuid)
          commit('show_alert', { message: 'Successfully deleted the comment.', 'type': 'success' })
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  bulkAddObservablesToCase({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/case/${uuid}/add_observables/_bulk`, data: data, method: 'POST' })
        .then(resp => {
          //commit('add_case_observables', resp.data.observables)
          commit('save_observables', resp.data.observables)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getSettings({ commit }, { uuid = null, store = true }) {
    return new Promise((resolve, reject) => {
      let url = `${BASE_URL}/settings`
      if (uuid) {
        url += `?organization=${uuid}`
      }
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('add_start')
          if (store) {
            commit('save_settings', resp.data)
          }
          commit('add_success')
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateSettings({ commit }, data) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/settings`, data: data, method: 'PUT' })
        .then(resp => {
          commit('show_alert', { message: 'Successfully updated config', 'type': 'success' })
          resolve(resp)
        })
        .catch(err => {
          commit('show_alert', { message: err.response.data.message, 'type': 'danger' })
          reject(err)
        })
    })
  },
  getMitreDataSources({ commit }, { with_coverage = false, organization = null }) {
    let url = `${BASE_URL}/mitre/data_sources`

    if (with_coverage) {
      url += `?with_coverage=${with_coverage}`
    }

    if (organization) {
      url += `&organization=${organization}`
    }

    return new Promise((resolve, reject) => {
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('set_mitre_data_sources', resp.data.data_sources)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getMitreTactics({ commit }, { page = 1, page_size = 25, name__like = null, external_id__like = null }) {

    let url = `${BASE_URL}/mitre/tactic?page=${page}&page_size=${page_size}`

    if (name__like) {
      url += `&name__like=${name__like}`
    }

    if (external_id__like) {
      url += `&external_id__like=${external_id__like}`
    }

    return new Promise((resolve, reject) => {
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_tactics', resp.data.tactics)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getMitreTechniques({ commit }, { page = 1, page_size = 50, name__like = null, external_id__like = null, phase_names = null }) {

    let url = `${BASE_URL}/mitre/technique?page=${page}&page_size=${page_size}`

    if (name__like) {
      url += `&name__like=${name__like}`
    }

    if (external_id__like) {
      url += `&external_id__like=${external_id__like}`
    }

    if (phase_names) {
      url += `&phase_names=${phase_names}`
    }

    return new Promise((resolve, reject) => {
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_techniques', resp.data.techniques)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getMitreTechnique({ commit }, { page = 1, page_size = 10, name__like = null, external_id = null, external_id__like = null, phase_names = null }) {

    let url = `${BASE_URL}/mitre/technique?page=${page}&page_size=${page_size}`

    if (name__like) {
      url += `&name__like=${name__like}`
    }

    if (external_id__like) {
      url += `&external_id__like=${external_id__like}`
    }

    if (external_id) {
      url += `&external_id=${external_id}`
    }

    if (phase_names) {
      url += `&phase_names=${phase_names}`
    }

    return new Promise((resolve, reject) => {
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_technique', resp.data.techniques[0])
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getPersistentPairingToken({ commit }, organization = null) {

    let url = `${BASE_URL}/settings/generate_persistent_pairing_token`
    if (organization) {
      url += `?organization=${organization}`
    }
    return new Promise((resolve, reject) => {
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getAuditLogs({ commit }, { selected_status, selected_event_type, page }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/audit_log?status=${selected_status}&event_type=${selected_event_type}&page=${page}`, method: 'GET' })
        .then(resp => {
          commit('save_audit_logs', resp.data.logs)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  fetchObservableHistory({ commit }, value) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/observable/history/${value}`, method: 'GET' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  fetchMFAQRCode({ commit }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/user/generate_mfa_qr`, method: 'GET' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  validateMFASetup({ commit }, token) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/user/validate_mfa_setup`, data: token, method: 'POST' })
        .then(resp => {
          commit('mfa_enabled', true)
          resolve(resp)
        })
        .catch(err => {
          commit('mfa_enabled', false)
          reject(err)
        })
    })
  },
  enableMFA({ commit }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/user/enable_mfa`, method: 'GET' })
        .then(resp => {
          commit('mfa_enabled', true)
          resolve(resp)
        })
        .catch(err => {
          commit('mfa_enabled', false)
          reject(err)
        })
    })
  },
  disableMFA({ commit }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/user/disable_mfa`, method: 'GET' })
        .then(resp => {
          if (resp.status == 200) {
            commit('mfa_enabled', false)
            resolve(resp)
          } else {
            commit('mfa_enabled', true)
            resolve(resp)
          }
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  toggleMFA({ commit }, data) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/user/toggle_mfa`, data: data, method: 'PUT' })
        .then(resp => {
          if (resp.status == 200) {
            resolve(resp)
          } else {
            resolve(resp)
          }
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  runSearch({ commit }, query) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/search/query`, data: query, method: 'POST' })
        .then(resp => {
          if (resp.status == 200) {
            resolve(resp)
          } else {
            resolve(resp)
          }
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
    })
  },
  testEventRuleQuery({ commit }, data) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event_rule/test_rule_rql`, data: data, method: 'POST' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getEventRuleStats({ commit }, { metrics = ['hits'], rules = [], save = false }) {

    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/event_rule/stats?metrics=${metrics}`

      if (rules) {
        base_url += `&rules=${rules}`
      }

      Axios({ url: base_url, method: 'GET' })
        .then(resp => {
          if (save) {
            commit('save_event_rule_stats', resp.data)
          }
          commit('loading_status', false)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  loadEventRules({ commit }, { page = 1, page_size = 25, sort_by = "created_at", sort_direction = "asc", rules = null, save = true }) {
    commit('loading_status', true)
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/event_rule?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`

      if (rules) {
        base_url += `&rules=${rules}`
      }

      Axios({ url: base_url, method: 'GET' })
        .then(resp => {
          if (save) {
            commit('save_event_rules', resp.data.event_rules)
          }
          commit('loading_status', false)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateEventRule({ commit }, { uuid, data }) {
    commit('loading_status', true)
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event_rule/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_event_rule', resp.data)
          commit('loading_status', false)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteEventRule({ commit }, { uuid }) {
    commit('loading_status', true)
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/event_rule/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('loading_status', false)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createRole({ commit }, data) {
    commit('loading_status', true)
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/role`, data: data, method: 'POST' })
        .then(resp => {
          commit('add_role', resp.data)
          commit('loading_status', false)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateRole({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/role/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_role', resp.data)
          commit('loading_status', false)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteRole({ commit }, { uuid }) {
    commit('loading_status', true)
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/role/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('remove_role', uuid)
          commit('loading_status', false)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  checkTaskStatus({ commit }, { uuid = null, complete = true, broadcast = false }) {
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/task?complete=${complete}`

      if (uuid) {
        base_url += `&uuid=${uuid}`
      }

      if (broadcast) {
        base_url += `&broadcast=${broadcast}`
      }

      Axios({ url: base_url, method: 'GET' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  importSigmaRule({ commit }, data) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection/parse_sigma`, data: data, method: 'POST' })
        .then(resp => {
          commit('loading_status', false)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getAgentPolicies({ commit }, { page = 1, page_size = 500, sort_by = "created_at", sort_direction = "asc", organization = null, save = true }) {
    let url = `${BASE_URL}/agent_policy?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`

    if (organization) {
      url += `&organization=${organization}`
    }
    return new Promise((resolve, reject) => {
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          if (save) {
            commit('save_agent_policies', resp.data.policies)
          }
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createAgentPolicy({ commit }, data) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/agent_policy`, data: data, method: 'POST' })
        .then(resp => {
          commit('save_agent_policy', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateAgentPolicy({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/agent_policy/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('save_agent_policy', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getServiceAccounts({ commit }, { }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/service_account`, method: 'GET' })
        .then(resp => {
          commit('save_service_accounts', resp.data.service_accounts)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createServiceAccount({ commit }, data) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/service_account`, data: data, method: 'POST' })
        .then(resp => {
          commit('add_service_account', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getObservableMetric({ commit }, { value, data_type = 'general', organization }) {
    return new Promise((resolve, reject) => {
      value = encodeURI(encodeURIComponent(value))
      let url = `${BASE_URL}/observable/${value}/hits`
      if (data_type) {
        url += `?data_type=${data_type}`
      }
      if (organization) {
        url += `&organization=${organization}`
      }
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getAssetDetails({ commit }, { hostname = null, organization = null, host__ip = null }) {
    return new Promise((resolve, reject) => {
      let url = `${BASE_URL}/asset?organization=${organization}`
      if (hostname) {
        url += `&host__name=${hostname}`
      }

      if (host__ip) {
        url += `&host__ip=${host__ip}`
      }

      Axios({ url: url, method: 'GET' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  exportDetection({ commit }, { uuid, format = 'json' }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection/${uuid}/export?format=${format}`, method: 'GET' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  exportSelectedDetections({ commit }, { uuids, format = 'json' }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection/export?format=${format}`, data: { detections: uuids }, method: 'POST' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  disableSelectedDetections({ commit }, { uuids }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection/disable`, data: { detections: uuids }, method: 'POST' })
        .then(resp => {
          for (let detection in resp.data) {
            commit('update_detection', resp.data[detection])
          }
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  assessSelectedDetections({ commit }, { uuids }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection/assess`, data: { detections: uuids }, method: 'POST' })
        .then(resp => {
          for (let detection in resp.data) {
            commit('update_detection', resp.data[detection])
          }
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  enableSelectedDetections({ commit }, { uuids }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection/enable`, data: { detections: uuids }, method: 'POST' })
        .then(resp => {
          for (let detection in resp.data) {
            commit('update_detection', resp.data[detection])
          }
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteSelectedDetections({ commit }, { uuids }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection/delete`, data: { detections: uuids }, method: 'DELETE' })
        .then(resp => {
          for (let detection in resp.data.detections) {
            commit('remove_detection', resp.data.detections[detection])
          }
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  clearDetectionWarnings({ commit }, { uuids }) {
    commit('loading_status', true)
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection/clear_warnings`, data: { detections: uuids }, method: 'POST' })
        .then(resp => {
          commit('update_detections', resp.data)
          resolve(resp)
          commit('loading_status', false)
        })
        .catch(err => {
          reject(err)
          commit('loading_status', false)
        })
    })
  },
  importDetections({ commit }, { data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection/import`, data: data, method: 'POST' })
        .then(resp => {
          for (let detection in resp.data) {
            commit('update_detection', resp.data[detection])
          }
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  downloadSOCReport({ commit }, { organization, days = null, soc_start_hour = null, soc_end_hour = null, utc_offset = null }) {
    return new Promise((resolve, reject) => {
      let url = `${BASE_URL}/reporting/${organization}`
      Axios({ url: url, method: 'GET', params: { days: days, soc_start_hour: soc_start_hour, soc_end_hour: soc_end_hour, utc_offset: utc_offset } })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getDetectionRepositories({ commit }, { page = 1, page_size = 10000, sort_by = "created_at", sort_direction = "asc", techniques = [], tactics = [], save = true, organization = null }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection_repository`, method: 'GET' })
        .then(resp => {
          commit('save_detection_repositories', resp.data.repositories)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getDetectionRepositorySubscription({ commit }, { uuid }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection_repository/${uuid}/subscription`, method: 'GET' })
        .then(resp => {
          commit('set_detection_repository_subscription', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateDetectionRepositorySubscription({ commit }, { repository_uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection_repository/${repository_uuid}/subscription`, data: data, method: 'PUT' })
        .then(resp => {
          commit('set_detection_repository_subscription', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createDetectionRepositorySubscription({ commit }, { repository_uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection_repository/${repository_uuid}/subscribe`, data: data, method: 'POST' })
        .then(resp => {
          commit('update_detection_repository', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteDetectionRepositorySubscription({ commit }, { repository_uuid }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection_repository/${repository_uuid}/unsubscribe`, method: 'POST' })
        .then(resp => {
          commit('update_detection_repository', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  synchronizeDetectionRepository({ commit }, { repository_uuid }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection_repository/${repository_uuid}/sync`, method: 'POST' })
        .then(resp => {
          commit('update_detection_repository', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  synchronizeLocalSubscribers({ commit }, { uuid }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection_repository/${uuid}/sync_local_subscribers`, method: 'POST' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  addDetectionToRepository({ commit }, { uuid, detections }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection_repository/${uuid}/add_detections`, data: { detections: detections }, method: 'POST' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  removeDetectionFromRepository({ commit }, { uuid, detections }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection_repository/${uuid}/remove_detections`, data: { detections: detections }, method: 'POST' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createDetectionRepository({ commit }, { data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection_repository`, data: data, method: 'POST' })
        .then(resp => {
          commit('add_detection_repository', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateDetectionRepository({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection_repository/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_detection_repository', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteDetectionRepository({ commit }, { uuid }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/detection_repository/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('remove_detection_repository', uuid)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getIntegrations({ commit }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/integration`, method: 'GET' })
        .then(resp => {
          commit('store_integrations', resp.data.integrations)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getIntegration({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/integration/${uuid}`, method: 'GET' })
        .then(resp => {
          commit('store_integration', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getIntegrationConfigurations({ commit }, {uuid, organization = null}) {

    return new Promise((resolve, reject) => {

      let url = `${BASE_URL}/integration/${uuid}/configurations`

      if (organization) {
        url += `?organization=${organization}`
      }


      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('store_integration_configurations', resp.data['configurations'])
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createIntegrationConfiguration({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/integration/${uuid}/configurations`, data: data, method: 'POST' })
        .then(resp => {
          commit('add_integration_configuration', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateIntegrationConfiguration({ commit }, { uuid, configuration_uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/integration/${uuid}/configurations/${configuration_uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_integration_configuration', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteIntegrationConfiguration({ commit }, { uuid, configuration_uuid }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/integration/${uuid}/configurations/${configuration_uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('remove_integration_configuration', configuration_uuid)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  enableIntegrationConfiguration({ commit }, { uuid, configuration_uuid }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/integration/${uuid}/configurations/${configuration_uuid}/enable`, method: 'POST' })
        .then(resp => {
          commit('update_integration_configuration', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  disableIntegrationConfiguration({ commit }, { uuid, configuration_uuid }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/integration/${uuid}/configurations/${configuration_uuid}/disable`, method: 'POST' })
        .then(resp => {
          commit('update_integration_configuration', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getConfiguredActions({ commit }, { source_object_type = [], observable_type = [], trigger = 'manual' }) {
    return new Promise((resolve, reject) => {
      let url = `${BASE_URL}/integration/configured_actions?trigger=${trigger}`
      if (source_object_type && source_object_type.length > 0) {
        url += `&source_object_type=${source_object_type}`
      }

      if (observable_type && observable_type.length > 0) {
        url += `&observable_type=${observable_type}`
      }

      Axios({ url: url, method: 'GET', params: { source_object_type: source_object_type, observable_type: observable_type } })
        .then(resp => {
          commit('store_configured_actions', resp.data['actions'])
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  runAction({ commit }, payload) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/integration/run_action`, data: payload, method: 'POST' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createRoleMappingPolicy({ commit }, data) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/sso/mapping_policy`, data: data, method: 'POST' })
        .then(resp => {
          commit('add_sso_role_mapping', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getRoleMappingPolicies({ commit }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/sso/mapping_policy`, method: 'GET' })
        .then(resp => {
          commit('save_sso_role_mappings', resp.data.policies)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateRoleMappingPolicy({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/sso/mapping_policy/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_sso_role_mapping', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteRoleMappingPolicy({ commit }, { uuid }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/sso/mapping_policy/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('delete_sso_role_mapping', uuid)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  activateRoleMappingPolicy({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/sso/mapping_policy/${uuid}/activate`, method: 'PUT' })
        .then(resp => {
          commit('update_sso_role_mapping', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deactivateRoleMappingPolicy({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/sso/mapping_policy/${uuid}/deactivate`, method: 'PUT' })
        .then(resp => {
          commit('update_sso_role_mapping', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createSSOProvider({ commit }, data) {
    commit('loading_status', true)
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/sso/provider`, data: data, method: 'POST' })
        .then(resp => {
          commit('add_sso_provider', resp.data)
          commit('loading_status', false)
          resolve(resp)
        })
        .catch(err => {
          commit('loading_status', false)
          reject(err)
        })
    })
  },
  getSSOProviders({ commit }) {
    commit('loading_status', true)
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/sso/provider`, method: 'GET' })
        .then(resp => {
          commit('save_sso_providers', resp.data.providers)
          commit('loading_status', false)
          resolve(resp)
        })
        .catch(err => {
          commit('loading_status', false)
          reject(err)
        })
    })
  },
  updateSSOProvider({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/sso/provider/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_sso_provider', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  activateSSOProvider({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/sso/provider/${uuid}/activate`, method: 'PUT' })
        .then(resp => {
          commit('update_sso_provider', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deactivateSSOProvider({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/sso/provider/${uuid}/deactivate`, method: 'PUT' })
        .then(resp => {
          commit('update_sso_provider', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteSSOProvider({ commit }, { uuid }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/sso/provider/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('remove_sso_provider', uuid)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getConfiguredOutputs({ commit }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/agent/policy/outputs`, method: 'GET' })
        .then(resp => {
          commit('save_outputs', resp.data.outputs)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getDataSourceTemplates({ commit }, organization = null) {
    return new Promise((resolve, reject) => {
      let url = `${BASE_URL}/data_source_template`

      if (organization) {
        url += `?organization=${organization}`
      }
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_data_source_templates', resp.data.templates)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createDataSourceTemplate({ commit }, data) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/data_source_template`, data: data, method: 'POST' })
        .then(resp => {
          commit('add_data_source_template', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateDataSourceTemplate({ commit }, { uuid, template }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/data_source_template/${uuid}`, data: template, method: 'PUT' })
        .then(resp => {
          commit('update_data_source_template', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteDataSourceTemplate({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/data_source_template/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('remove_data_source_template', uuid)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getSchedules({ commit }, { active = null, organization = null }) {
    return new Promise((resolve, reject) => {
      let url = `${BASE_URL}/schedule`

      let params = false;

      if (active) {
        if (params) {
          url += `&active=${active}`
        } else {
          url += `?active=${active}`
          params = true
        }

      }

      if (organization) {
        if (params) {
          url += `&organization=${organization}`
        } else {
          url += `?organization=${organization}`
          params = true
        }
      }

      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_schedules', resp.data.schedules)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createSchedule({ commit }, data) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/schedule`, data: data, method: 'POST' })
        .then(resp => {
          commit('add_schedule', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateSchedule({ commit }, { uuid, data }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/schedule/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_schedule', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteSchedule({ commit }, uuid) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/schedule/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('remove_schedule', uuid)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getReleaseNotes({ commit }, { version = "current" }) {

    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/release-notes?version=${version}`, method: 'GET' })
        .then(resp => {
          commit('save_release_notes', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getFimRules({ commit }, { organization = null }) {

    return new Promise((resolve, reject) => {
      let url = `${BASE_URL}/fim`

      if (organization) {
        url += `?organization=${organization}`
      }

      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_fim_rules', resp.data.rules)
          resolve(resp)

        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createFIMRule({ commit }, data) {
      
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/fim`, data: data, method: 'POST' })
        .then(resp => {
          commit('add_fim_rule', resp.data)
          resolve(resp)

        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateFIMRule({ commit }, { uuid, data }) {

    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/fim/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_fim_rule', resp.data)
          resolve(resp)

        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteFIMRule({ commit }, { uuid }) {

    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/fim/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('remove_fim_rule', uuid)
          resolve(resp)

        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getBenchmarkRules({ commit }, { organization = null }) {

    let url = `${BASE_URL}/benchmark/rules`

    if (organization) {
      url += `?organization=${organization}`
    }

    return new Promise((resolve, reject) => {
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_benchmark_rules', resp.data.rules)
          resolve(resp)

        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getBenchmarkMetrics({ commit }, { rule_uuids = null }) {

    let url = `${BASE_URL}/benchmark/metrics`

    if (rule_uuids) {
      url += `?rule_uuids=${rule_uuids}`
    }

    return new Promise((resolve, reject) => {
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_benchmark_metrics', resp.data.metrics)
          resolve(resp)

        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getBenchmarkRule({ commit }, { uuid }) {
      
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/benchmark/rules/${uuid}`, method: 'GET' })
        .then(resp => {
          commit('save_benchmark_rule', resp.data)
          resolve(resp)

        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getBenchmarkAssets({ commit }, { uuid }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/benchmark/rules/${uuid}/assets`, method: 'GET' })
        .then(resp => { 
          commit('save_benchmark_assets', resp.data.assets)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getBenchmarkAssetHistory({commit}, { uuid, asset_uuid }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/benchmark/rules/${uuid}/assets/${asset_uuid}/history`, method: 'GET' })
        .then(resp => { 
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getAgentInstalledApplications({ commit }, { uuid }) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/application/agent/${uuid}`, method: 'GET' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getAgentTags({ commit }, { organization = null, namespace = null, value = null }) {

    let url = `${BASE_URL}/agent_tag`
    let params = [];

    if (organization) {
      params.push(`organization=${organization}`)
    }

    if (namespace) {
      params.push(`namespace=${namespace}`)
    }

    if (value) {
      params.push(`value=${value}`)
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`
    }

    return new Promise((resolve, reject) => {
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_agent_tags', resp.data.tags)
          resolve(resp)

        })
        .catch(err => {
          reject(err)
        })
    })
  },
  createAgentTag({ commit }, data) {
      
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/agent_tag`, data: data, method: 'POST' })
        .then(resp => {
          commit('add_agent_tag', resp.data)
          commit('save_agent_tag', resp.data)
          resolve(resp)

        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateAgentTag({ commit }, { uuid, data }) {

    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/agent_tag/${uuid}`, data: data, method: 'PUT' })
        .then(resp => {
          commit('update_agent_tag', resp.data)
          resolve(resp)

        })
        .catch(err => {
          reject(err)
        })
    })
  },
  deleteAgentTag({ commit }, { uuid }) {

    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/agent_tag/${uuid}`, method: 'DELETE' })
        .then(resp => {
          commit('remove_agent_tag', uuid)
          resolve(resp)

        })
        .catch(err => {
          reject(err)
        })
    })
  },
  testAgentTag({ commit }, data) {

    let url = `${BASE_URL}/agent_tag/test`
      
    return new Promise((resolve, reject) => {
      Axios({ url: url, data: data, method: 'POST' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getAgentLogs({ commit }, { agent = null, organization = null, level = null, module = null, start_date = null, end_date = null }) {
    let url = `${BASE_URL}/agent/log?agent=${agent}`

    if (organization) {
      url += `&organization=${organization}`
    }

    if (level) {
      url += `&level=${level}`
    }

    if (module) {
      url += `&module=${module}`
    }

    if (start_date) {
      url += `&start_date=${start_date}`
    }

    if (end_date) {
      url += `&end_date=${end_date}`
    }

    return new Promise((resolve, reject) => {
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_agent_logs', resp.data.logs)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateProfilePicture({commit}, {uuid, form}) {
      // Submit the image to the server as a form-multipart file upload
      return new Promise((resolve, reject) => {
        Axios({ url: `${BASE_URL}/user/${uuid}/profile_picture`, data: form, method: 'POST', headers: { 'Content-Type': 'multipart/form-data' } })
          .then(resp => {
            resolve(resp)
          })
          .catch(err => {
            reject(err)
          })
      })
  },
  getProfilePicture({commit}, {uuid}) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/user/${uuid}/profile_picture`, method: 'GET', responseType: 'blob' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  removeProfilePicture({commit}, {uuid}) {
    return new Promise((resolve, reject) => {
      Axios({ url: `${BASE_URL}/user/${uuid}/profile_picture`, method: 'DELETE' })
        .then(resp => {
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getApplicationSummary({ commit }, { organization = null}) {
    let url = `${BASE_URL}/application/summary`

    if (organization) {
      url += `?organization=${organization}`
    }

    return new Promise((resolve, reject) => {
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_application_summary', resp.data)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  getApplicationEndpoints({ commit }, { organization = null, name = [], vendor = [], version = []}) {

    let url = `${BASE_URL}/application/summary/endpoints`

    let params = [];
    if (organization) {
      params.push(`organization=${organization}`)
    }

    if (name.length > 0) {
      params.push(`name=${name}`)
    }

    if (vendor.length > 0) {
      params.push(`vendor=${vendor}`)
    }

    if (version.length > 0) {
      params.push(`version=${version}`)
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`
    }

    return new Promise((resolve, reject) => {
      Axios({ url: url, method: 'GET' })
        .then(resp => {
          commit('save_application_endpoints', resp.data.endpoints)
          resolve(resp)
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  plugins: [createPersistedState({
    key: 'reflex-state',
    paths: ['observable_filters', 'case_filters', 'intel_filters', 'current_user', 'case_templates', 'quick_filters', 'selected_detection_filters',
  'log_searches', 'search_on_change']
  })]
})