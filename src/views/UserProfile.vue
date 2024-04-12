<template>
  <div>
    <CRow>
      <CCol>
        <CRow class="page-heading page-heading-row">
          <CCol col="10"><h1>User Profile</h1> </CCol>
          <CCol class="text-right"> </CCol>
        </CRow>
        <CTabs
          addNavWrapperClasses="page-nav"
          addTabClasses="page-nav-tab-body"
          addNavClasses="page-nav-tab"
        >
          <CTab title="Overview">
            <CRow>
              <CCol col="4">
                <CCard>
                  <CCardBody>
                    <CRow>
                      <CCol>
                        <img
                          style="cursor: pointer"
                          class="profile-photo"
                          :src="profile_picture"
                          @click="startProfilePictureUpdate()"
                        />
                        <div class="user-profile-name">
                          <h2>
                            {{ current_user.first_name }} {{ current_user.last_name }}
                          </h2>
                          <label>Chief Technology Officer</label><br>
                          <i class="fas fa-envelope"/>&nbsp;{{ current_user.email }}
                        </div>
                      </CCol>
                    </CRow>
                    <CRow style="padding-top: 20px">
                      <CCol>
                        <CRow>
                          <CCol>
                            <ObjectAttribute label="Last Login"
                              ><template #value>{{
                                current_user.last_logon | moment("MMM, Mo, YYYY HH:mm:ss")
                              }}</template></ObjectAttribute
                            >
                          </CCol>
                          <CCol>
                            <ObjectAttribute
                              label="MFA Enabled"
                              :value="current_user.mfa_enabled ? 'Yes' : 'No'"
                            />
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol>
                            <label>MFA Enabled</label>
                            <RBlockSwitch :checked.sync="current_user.mfa_enabled" v-on:change="current_user.mfa_enabled ? start_mfa_wizard() : disable_mfa()" />
                          </CCol>
                        </CRow>
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol class="task-list">
                <CCard>
                  <CCardHeader>
                    <CBadge class="tag" size="md" color="primary">5</CBadge> Open Tasks
                  </CCardHeader>
                  <CCardBody>
                    <CRow v-for="i in 5" :key="i">
                      <CCol>
                        <h6>Task {{ i }}</h6>
                        <p>Task Description</p>
                      </CCol>
                      <CCol col="3" class="text-right">
                        <ObjectAttribute label="Status" value="Open" />
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol class="task-list">
                <CCard>
                  <CCardHeader>
                    <CBadge class="tag" size="md" color="primary">11</CBadge> Open Cases
                  </CCardHeader>
                  <CCardBody
                    ><CRow v-for="i in 11" :key="i">
                      <CCol>
                        <h6>Task {{ i }}</h6>
                        <p>Task Description</p>
                      </CCol>
                      <CCol col="3" class="text-right">
                        <ObjectAttribute label="Status" value="Open" />
                      </CCol> </CRow
                  ></CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </CTab>
          <CTab title="Security">
            <h2 class="page-sub-header">Security Settings</h2>
            <CRow>
              <CCol col="6">
                <CCard>
                  <CCardBody>
                    <h4>Permission Overview</h4>
                    <CRow>
                      <CCol>
                        <ObjectAttribute label="Role(s)">
                          <template #value>
                            <TagList
                              :tags="current_user.role"
                              label="name"
                              :tagIcon="false"
                            />
                          </template>
                        </ObjectAttribute>
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol
                        col="3"
                        v-for="(permission, key) in current_user.permissions"
                        :key="key"
                      >
                        <ObjectAttribute :label="key">
                          <template #value>
                            {{ permission }}
                          </template>
                        </ObjectAttribute>
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol>
                <CCard>
                  <CCardBody>
                    <CButton
                      color="primary"
                      @click="edit_password_modal = !edit_password_modal"
                      >Change Password</CButton
                    >
                    &nbsp;
                    <CButton
                      v-if="!current_user.mfa_enabled"
                      color="primary"
                      @click="start_mfa_wizard()"
                      >Enable MFA
                    </CButton>
                    <CButton v-else color="danger" @click="disable_mfa()"
                      >Disable MFA</CButton
                    >
                  </CCardBody>
                </CCard></CCol
              >
            </CRow>
          </CTab>
          <CTab title="Notifications">
            <h2 class="page-sub-header">Notification Settings</h2>
            <CCard>
              <CCardBody>
              <CRow>
                <CCol col=6>
                  <h5>Platform Notifications</h5>
                  <p>Get emails to find out what's going on you're not in the system.  You can always change these settings later.</p>
                </CCol>
                <CCol>
                  <label>News and Updates</label>
                </CCol>
                <CCol col=4>
                  <CRow>
                    <CCol>
                      <RSwitch :checked.sync="notifications.email.news_and_updates" />
                    </CCol>
                  </CRow>
                </CCol>
              </CRow>
              <hr class="horizontal-separator">
              <CRow>
                    <CCol col=8>
                    </CCol>
                    <CCol>
                      <label>ReflexSOAR Native</label>
                    </CCol>
                    <CCol>
                      <label>Email</label>
                    </CCol>
                  </CRow>
              <hr class="horizontal-separator">
              <CRow>
                <CCol>
                  <h5>Case Notifications</h5>
                  <p>Get notified when things happen in your cases.</p>
                </CCol>
                <CCol>                  
                  <CRow>
                    <CCol>
                      <label>Case Assigned to Me</label>
                    </CCol>
                    <CCol>
                      <RSwitch/>
                    </CCol>
                    <CCol>
                      <RSwitch/>
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol>
                      <label>Case Severity Change</label>
                    </CCol>
                    <CCol>
                      <RSwitch/>
                    </CCol>
                    <CCol>
                      <RSwitch/>
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol>
                      <label>Case Closed</label>
                    </CCol>
                    <CCol>
                      <RSwitch/>
                    </CCol>
                    <CCol>
                      <RSwitch/>
                    </CCol>
                  </CRow>
                </CCol>
              </CRow>
              <hr class="horizontal-separator">
              <CRow>
                <CCol>
                  <h5>Comment Notifications</h5>
                  <p>Get notified when things happen in your cases.</p>
                </CCol>
                <CCol>
                  <CRow>
                    <CCol>
                      <label>Mentioned in Comment</label>
                    </CCol>
                    <CCol>
                      <RSwitch/>
                    </CCol>
                    <CCol>
                      <RSwitch/>
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol>
                      <label>Comment Added to Event</label>
                    </CCol>
                    <CCol>
                      <RSwitch/>
                    </CCol>
                    <CCol>
                      <RSwitch/>
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol>
                      <label>Comment Added to Case (Assigned)</label>
                    </CCol>
                    <CCol>
                      <RSwitch/>
                    </CCol>
                    <CCol>
                      <RSwitch/>
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol>
                      <label>Comment Added to Case (Watching)</label>
                    </CCol>
                    <CCol>
                      <RSwitch/>
                    </CCol>
                    <CCol>
                      <RSwitch/>
                    </CCol>
                  </CRow>
                </CCol>
              </CRow></CCardBody>
            </CCard>
          </CTab>
        </CTabs>
      </CCol>
    </CRow>
    <CModal
      title="Change Password"
      :centered="true"
      size="lg"
      :show.sync="edit_password_modal"
    >
      <CAlert :show.sync="error" color="danger" closeButton>
        {{ error_message }}
      </CAlert>
      <CForm @submit.prevent="updatePassword" id="userForm">
        <CInput
          v-model="password"
          type="password"
          label="Password"
          placeholder="Enter your desired password..."
          required
        />
        <CInput
          v-model="confirm_password"
          type="password"
          label="Confirm Password"
          placeholder="Confirm password"
          required
        />
      </CForm>
      <template #footer>
        <CButton @click="dismissPasswordModal()" color="secondary">Cancel</CButton>
        <CButton type="submit" form="userForm" color="primary">Update Password</CButton>
      </template>
    </CModal>
    <CModal title="Update Profile Picture" :centered="true" size="lg" :show.sync="update_profile_picture">
      <form ref="profile_picture_form" id="profile_picture_form" enctype="multipart/form-data">
        <!-- Create a drag and drop area for the user to upload a new profile picture, the user should
        also get a preview of the image they just uploaded before hitting submit.  The user should
        be able to crop the image before submitting it. -->
        <CRow>
          <CCol>
            <CAlert :show.sync="error" color="danger" closeButton>
              {{ error_message }}
            </CAlert>
          </CCol>
        </CRow>
        <CRow>
          <CCol col="8">
            <!-- Image drop zone -->
            <div class="drop-zone">
              <div class="drop-zone__prompt">Drop file here or click to upload</div>
              <input type="file" name="profile_picture_input" class="drop-zone__input" @change="previewProfilePicture()" />
            </div>
          </CCol>
          <CCol class="text-right" col="4">
            <!-- Image preview -->
            <div class="image-preview" id="imagePreview">
              <img src="" class="image-preview__image profile-photo" />
            </div>
          </CCol>
        </CRow>
        <CRow class="image-preview-wrapper">
          <CCol>
            <span class="text-muted">Supported file types: jpg, jpeg, png.  Max size 5MB.  Recommended Size: 600px x 600px</span>
          </CCol>
        </CRow>
      </form>

        <template #footer>
          <CButton @click="dismissProfilePictureModal()" color="secondary">Cancel</CButton>
          <CButton @click="removeProfilePicture()" color="danger">Remove Profile Picture</CButton>
          <CButton @click="updateProfilePicture()" form="userForm" color="primary">Update Profile Picture</CButton>
        </template>
    </CModal>
    <CModal title="Enable MFA" :centered="true" size="lg" :show.sync="enable_mfa_modal">
      <CAlert :show.sync="error" color="danger" closeButton>
        {{ error_message }}
      </CAlert>
      <div v-if="mfa_wizard_step == 1">
        <p>
          Welcome to the multi-factor authentication wizard. Follow the steps below to
          setup MFA for your account.
        </p>
        <ol>
          <li>Click next, open your MFA app (e.g. Duo, Google Authenticator, etc.)</li>
          <li>Scan the QR code, click next</li>
          <li>Verify the code</li>
          <li>Setup complete!</li>
        </ol>
      </div>
      <div v-if="mfa_wizard_step == 2">
        <center>
          <div
            v-if="qr_code === null"
            style="margin: auto; text-align: center; verticle-align: middle"
          >
            <p>Generating QR Code</p>
            <CSpinner color="dark" style="width: 6rem; height: 6rem" />
          </div>
          <div v-else v-html="qr_code"></div>
        </center>
      </div>
      <div v-if="mfa_wizard_step == 3">
        <CInput v-model="mfa_token" label="Confirm MFA Code" />
      </div>
      <center></center>
      <template #footer>
        <CButton @click="dismissMfaSetup()" color="secondary"
          >Cancel</CButton
        >
        <CButton
          color="info"
          v-if="mfa_wizard_step > 1 && mfa_wizard_step < 4"
          @click="previousStep()"
          >Previous Step
        </CButton>
        <CButton
          color="primary"
          v-if="mfa_wizard_step > 0 && mfa_wizard_step < 3"
          @click="nextStep()"
          >Next</CButton
        >
        <CButton color="success" v-if="mfa_wizard_step == 3" @click="finishMFASetup()"
          >Finish</CButton
        >
      </template>
    </CModal>
  </div>
</template>

<style>
.drop-zone {
  height: 200px;
  padding: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #f2f2f2;
  border: 2px dashed #ccc;
  border-radius: 5px;
  font-family: sans-serif;
  font-size: 16px;
  cursor: pointer;
}

.drop-zone__prompt {
  font-size: 16px;
}

.drop-zone__input {
  display: none;
}

.image-preview-wrapper {
  margin-top: 10px;
}

.image-preview {
  width: 200px;
  height: 200px;
  position: relative;
  overflow: hidden;
  border-radius: 5px;
}

.image-preview__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-preview__default-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #999;
  font-size: 14px; 
}
</style>


<script>
import { mapState } from "vuex";

import CalloutCard from "./components/CalloutCard.vue";
import ObjectAttribute from "./components/ObjectAttribute.vue";
import TagList from "./components/TagList.vue";
import RSwitch from "./components/Switch.vue";
import RBlockSwitch from "./components/BlockSwitch.vue";

export default {
  name: "Dashboard",
  components: {
    CalloutCard,
    ObjectAttribute,
    TagList,
    RSwitch,
    RBlockSwitch
  },
  data() {
    return {
      password: "",
      profile_picture: "",
      update_profile_picture: false,
      confirm_password: "",
      error: false,
      error_message: "",
      edit_password_modal: false,
      enable_mfa_modal: false,
      qr_code: null,
      mfa_wizard_step: 0,
      mfa_enable_success: false,
      success_message: null,
      reset_success: false,
      mfa_token: "",
      loading_code: false,
      notifications: {
        case: {
          assigned_to_me: {
            reflex_native: false,
            email: false,
          },
          severity_changed: {
            reflex_native: false,
            email: false,
          },
          comment_added: {
            reflex_native: false,
            email: false,
          }
        },
        email: {
          news_and_updates: false,
        }
      }
    };
  },
  mounted() {
    // Find the drop zone element by its class drop-zone
    const dropZone = document.querySelector(".drop-zone");
    
    dropZone.addEventListener("click", function () {
      // Find the drop-zone__input element by its class drop-zone__input
      document.querySelector(".drop-zone__input").click();

    });
    this.profilePicture();
  },
  methods: {
    profilePicture() {
      let uuid = this.current_user.uuid;
      let photo_frame = document.querySelector(".profile-photo");
      this.$store.dispatch('getProfilePicture', {uuid: uuid}).then((resp) => {
        const imageUrl = URL.createObjectURL(resp.data);
        photo_frame.src = imageUrl;

      }).catch((err) => {
        photo_frame.src = "data:image/jpeg;base64,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"

      })
      return this.profile_picture;
    },
    startProfilePictureUpdate() {
      // Set the preview image to the current profile picture
      let photo_frame = document.querySelector(".profile-photo");
      let imageUrl = photo_frame.src;
      let preview = document.getElementById("imagePreview");
      let img = preview.querySelector(".image-preview__image");
      img.src = imageUrl;
      this.update_profile_picture = true;
    },
    removeProfilePicture() {
      let uuid = this.current_user.uuid;
      this.$store.dispatch("removeProfilePicture", {uuid: uuid}).then((resp) => {
        this.success_message = "Successfully removed profile picture.";
        this.update_profile_picture = false;
        this.profilePicture();
      }).catch((err) => {
        this.error = true;
        this.error_message = "An error occured while trying to remove your profile picture.  Please try again later.";
      })
    },
    dismissProfilePictureModal() {
      this.update_profile_picture = false;
    },
    previewProfilePicture() {
      // Get preview element
      const preview = document.getElementById("imagePreview");

      // Get file
      const file = document.querySelector('input[type="file"]').files[0];

      // Create a FileReader
      const reader = new FileReader();

      // Check if file is present
      if (file) {
        // Set preview text
        preview.classList.remove("image-preview__default-text");

        // Set preview image
        const img = preview.querySelector(".image-preview__image");
        img.src = URL.createObjectURL(file);
      }
    },
    updateProfilePicture() {
      let uuid = this.current_user.uuid

      let formData = new FormData(this.$refs.profile_picture_form);


      this.$store.dispatch("updateProfilePicture", {
        uuid: uuid,
        form: formData,
      }).then((resp) => {
        this.update_profile_picture = false;
        this.success_message = "Successfully updated profile picture.";
        this.profilePicture();
      }).catch((err) => {
        this.error = true;
        this.error_message = "An error occured while trying to update your profile picture.  Please try again later.";
      })
    },
    nextStep() {
      if (this.mfa_wizard_step == 1) {
        if (this.mfa_enable_success) {
          this.mfa_wizard_step += 1;
          this.loading_code = true;
          this.fetch_qr_code();
          this.loading_code = false;
          this.error = false;
          this.error_message = "";
          return 0;
        } else {
          this.error = true;
          this.error_message =
            "An error occuring while trying to enable MFA.  Please try again later.";
        }
      }

      if (this.mfa_wizard_step == 2) {
        this.error = false;
        this.error_message = "";
        this.mfa_wizard_step += 1;
      }
    },
    dismissMfaSetup() {
      if(this.current_user.mfa_enabled) {
        this.current_user.mfa_enabled = false;
      }
      this.enable_mfa_modal = false;
    },
    finishMFASetup() {
      let token = {
        token: this.mfa_token,
      };
      this.$store
        .dispatch("validateMFASetup", token)
        .then(() => {
          this.current_user.mfa_enabled = true;
          this.enable_mfa_modal = false;
          this.success_message = "Multi-factor authentication added successfully.";
        })
        .catch(() => {
          this.error = true;
          this.error_message = "Invalid MFA Code. Try again";
        });
    },
    previousStep() {
      if (this.mfa_wizard_step == 2) {
        this.qr_code = null;
        this.mfa_wizard_step == 1;
      }
      if (this.mfa_wizard_step == 1) {
        this.mfa_wizard_step = 1;
      } else {
        this.mfa_wizard_step -= 1;
      }
    },
    fetch_qr_code() {
      this.$store.dispatch("fetchMFAQRCode").then((resp) => {
        this.qr_code = resp.data;
      });
    },
    enable_mfa() {
      this.$store.dispatch("enableMFA").then(
        (resp) => {
          this.mfa_enable_success = true;
        },
        (err) => {
          this.mfa_enable_success = false;
        }
      );
    },
    disable_mfa() {
      this.$store.dispatch("disableMFA");
      this.current_user.mfa_enabled = false;
    },
    start_mfa_wizard() {
      this.enable_mfa();
      this.enable_mfa_modal = true;
      this.mfa_enable_success = false;
      this.mfa_wizard_step = 1;
    },
    dismissPasswordModal() {
      this.edit_password_modal = false;
    },
    changePasswordModal() {
      this.password = "";
      this.confirm_password = "";
      this.error = false;
      this.error_message = "";
      this.edit_password_modal = true;
    },
    updatePassword() {
      if (this.password != this.confirm_password) {
        this.error = true;
        this.error_message = "Passwords do not match";
      } else {
        this.error = false;
        this.error_message = "";
        let data = {
          password: this.confirm_password,
        };
        let uuid = this.current_user.uuid;
        this.$store
          .dispatch("updateUserPassword", data)
          .then((resp) => {
            this.edit_password_modal = false;
            this.success_message = "Successfully changed password.";
            this.reset_success = true;
            this.password = "";
            this.confirm_password = "";
          })
          .catch((err) => {
            this.reset_success = false;
          });
      }
    },
    dismissPaswordModal() {
      (this.edit_password_modal = false),
        (this.password = ""),
        (this.confirm_password = "");
    },
  },
  beforeMount() {
    this.$store.dispatch("getMe");
  },
  computed: mapState(["current_user"]),
};
</script>
