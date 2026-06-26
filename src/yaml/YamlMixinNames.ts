// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/YamlMixinNames.kt

export const YamlMixinNames = {
  // common constants
  EDU_YAML_TYPE: "edu",
  TYPE: "type",
  CONTENT: "content",
  CUSTOM_NAME: "custom_name",
  TAGS: "tags",

  // course
  TITLE: "title",
  LANGUAGE: "language",
  SUMMARY: "summary",
  PROGRAMMING_LANGUAGE: "programming_language",
  PROGRAMMING_LANGUAGE_VERSION: "programming_language_version",
  SOLUTIONS_HIDDEN: "solutions_hidden",
  MODE: "mode",
  ENVIRONMENT: "environment",
  ENVIRONMENT_SETTINGS: "environment_settings",
  ADDITIONAL_FILES: "additional_files",
  CUSTOM_CONTENT_PATH: "custom_content_path",

  YAML_VERSION: "yaml_version",

  // coursera course
  SUBMIT_MANUALLY: "submit_manually",
  COURSE_TYPE_YAML: "coursera",

  // Hyperskill and Stepik courses are no longer supported.
  // The corresponding constants are kept to recognize such courses and do not deserialize them.
  HYPERSKILL_TYPE_YAML: "hyperskill",
  STEPIK_TYPE_YAML: "stepik",
  END_DATE_TIME: "end_date_time",

  // marketplace course
  MARKETPLACE_YAML_TYPE: "marketplace",
  VENDOR: "vendor",
  IS_PRIVATE: "is_private",
  MARKETPLACE_COURSE_VERSION: "course_version",
  GENERATED_EDU_ID: "generated_edu_id",

  // lesson
  UNIT: "unit",

  // framework lesson
  CURRENT_TASK: "current_task",
  IS_TEMPLATE_BASED: "is_template_based",

  // task
  FILES: "files",
  FEEDBACK_LINK: "feedback_link",
  FEEDBACK: "feedback",
  STATUS: "status",
  RECORD: "record",
  SOLUTION_HIDDEN: "solution_hidden",
  SUBMISSION_LANGUAGE: "submission_language",

  // theory task
  POST_SUBMISSION_ON_OPEN: "post_submission_on_open",

  // choice task
  IS_CORRECT: "is_correct",
  OPTIONS: "options",
  IS_MULTIPLE_CHOICE: "is_multiple_choice",
  FEEDBACK_CORRECT: "message_correct",
  FEEDBACK_INCORRECT: "message_incorrect",
  SELECTED_OPTIONS: "selected_options",
  QUIZ_HEADER: "quiz_header",
  LOCAL_CHECK: "local_check",

  // sorting based task
  ORDERING: "ordering",
  CAPTIONS: "captions",

  // table task
  ROWS: "rows",
  COLUMNS: "columns",

  // feedback
  MESSAGE: "message",
  TIME: "time",
  EXPECTED: "expected",
  ACTUAL: "actual",

  // task file
  NAME: "name",
  PLACEHOLDERS: "placeholders",
  VISIBLE: "visible",
  LEARNER_CREATED: "learner_created",
  TEXT: "text",
  ENCRYPTED_TEXT: "encrypted_text",
  IS_BINARY: "is_binary",
  EDITABLE: "editable",
  PROPAGATABLE: "propagatable",
  HIGHLIGHT_LEVEL: "highlight_level",

  // placeholder
  OFFSET: "offset",
  LENGTH: "length",
  PLACEHOLDER_TEXT: "placeholder_text",
  DEPENDENCY: "dependency",
  INIT_FROM_DEPENDENCY: "initialized_from_dependency",
  STUDENT_ANSWER: "student_answer",
  INITIAL_STATE: "initial_state",
  ENCRYPTED_POSSIBLE_ANSWER: "encrypted_possible_answer",
  SELECTED: "selected",

  // placeholder dependency
  SECTION: "section",
  LESSON: "lesson",
  TASK: "task",
  FILE: "file",
  PLACEHOLDER: "placeholder",
  IS_VISIBLE: "is_visible",

  // remote study item
  ID: "id",
  UPDATE_DATE: "update_date",
} as const

export type YamlMixinName = (typeof YamlMixinNames)[keyof typeof YamlMixinNames]
