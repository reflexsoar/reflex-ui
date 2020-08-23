<template>
<CRow>
    <CCol col v-if="loading">
        <div style="margin: auto; text-align:center; verticle-align:middle;">
           <CSpinner
                color="dark"
                style="width:6rem;height:6rem;"
            />
        </div>
    </CCol>
    <CCol col="12" v-else>
        <CRow>
            <CCol col="12" lg="8">
                <h1>{{project.name}}</h1>
                <template #tags='{tag}'>
                    {{tag.name}}
                </template>
                <li style="display: inline; margin-right: 2px;" v-for="tag in project.tags" :key="tag.name"><CButton color="dark" size="sm">{{ tag.name }}</CButton></li>
                <br><br>
                {{project.description}}
                <br><br>
            </CCol>
            <CCol col="12" lg="4" class="text-right">
                <CDropdown 
                    color="primary"
                    toggler-text="Options"
                >
                    <CDropdownItem>Add Finding</CDropdownItem>
                    <CDropdownItem>Generate Report</CDropdownItem>
                    <CDropdownDivider/>
                    <CDropdownItem>Close</CDropdownItem>
                </CDropdown>
            </CCol>
        </CRow>
        <CRow>
            <CCol col>
                <CCard class="shadow-sm">
                    <CCardHeader>
                        <b>Project Phase</b>
                    </CCardHeader>
                    <div class="stepper">
                        <div class="step complete"><button><div class="step-icon">1</div>Pre-Engagement</button><div class="md-step-bar-right active"></div></div>
                        <div class="step active"><div class="md-step-bar-left"></div><button><div class="step-icon">2</div>Scoping</button><div class="md-step-bar-right"></div></div>
                        <div class="step"><div class="md-step-bar-left"></div><button><div class="step-icon">3</div>Testing</button><div class="md-step-bar-right"></div></div>
                        <div class="step"><div class="md-step-bar-left"></div><button><div class="step-icon">4</div>Report Writing</button><div class="md-step-bar-right"></div></div>
                        <div class="step"><div class="md-step-bar-left"></div><button><div class="step-icon">5</div>Report Review</button><div class="md-step-bar-right"></div></div>
                        <div class="step"><div class="md-step-bar-left"></div><button><div class="step-icon">6</div>Fix Verification</button><div class="md-step-bar-right"></div></div>
                        <div class="step"><div class="md-step-bar-left"></div><button><div class="step-icon">7</div>Finalized</button></div>
                    </div>
                </CCard>
            </CCol>
        </CRow>
        <CRow>
            <CCol col="12">
                <CRow>
                    <CCol col="12">
                        <CCard class="shadow-sm">
                            <CCardHeader>
                                <b>Summary</b>
                            </CCardHeader>
                            <CCardBody>
                                <CRow>
                                    <CCol col="12" sm="12" lg="2">
                                        <CCallout color="danger">Critical<br><h3>1</h3></CCallout>
                                    </CCol>
                                    <CCol col="12" sm="12" lg="2">
                                        <CCallout color="warning">Medium<br><h3>31</h3></CCallout>
                                    </CCol>
                                    <CCol col="12" sm="12" lg="2">
                                        <CCallout color="dark">Low<br><h3>3,400</h3></CCallout>
                                    </CCol>
                                    <CCol col="12" sm="12" lg="2">
                                        <CCallout color="info">Info<br><h3>7</h3></CCallout>
                                    </CCol>
                                    <CCol col="12" sm="12" lg="2">
                                        <CCallout color="secondary">Closed<br><h3>7</h3></CCallout>
                                    </CCol>
                                </CRow>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
                <CRow>
                    <CCol col="12">
                        <CCard class="shadow-sm">
                            <CCardHeader>
                                <b>Findings</b>
                                <span style="float: right" v-on:click="hideAll()">Show/Hide All</span>
                            </CCardHeader>
                            <CCardBody>
                                <CDropdown 
                    color="secondary"
                    toggler-text="Options"
                    style="float:right"
                    size="sm"
                >
                    <CDropdownHeader>Status</CDropdownHeader>
                    <CDropdownItem>Open</CDropdownItem>
                    <CDropdownItem>Validation</CDropdownItem>
                    <CDropdownItem>Fix Verified</CDropdownItem>
                    <CDropdownDivider/>
                    <CDropdownItem>Close</CDropdownItem>
                </CDropdown><CButton color="secondary" size="sm" style="float:right; margin-right:5px;" v-on:click="collapse['a'] = !collapse['a']">View</CButton><CButton disabled color="primary" size="sm" style="float: right; margin-right: 5px;">Status: Open</CButton>
                                <CButton color="danger" size="sm" style="float: right; margin-right: 5px;">Critical</CButton>&nbsp;<h3 >
                                    Cross-Site Scripting on Dashboard page</h3>
                                <CCollapse :show="collapse['a']" ><b>URI:</b> http://penman.io/dashboard<br><br>
                                <li style="display: inline; margin-right: 2px;"><CButton color="dark" size="sm">OWASP: A1</CButton></li><li style="display: inline; margin-right: 2px;"><CButton color="dark" size="sm">CWE-79: Type 1</CButton></li><li style="display: inline; margin-right: 2px;"><CButton color="dark" size="sm">MITRE: T1189</CButton></li><br><br>
                                <p>I don't wanna see you in here again. Right, <code class="language-http">alert('xss');</code> gimme a Pepsi free. No, fine, no , good, fine, good. Oh. Yeah, he's right here.</p>
                                <p>Breakfast. Excuse me. whoa, this is it, this is the <code class="language-http">onmouseover="javascript:alert('xss');"</code> part coming up, Doc. Yeah, I think it's a major embarrassment having an uncle in prison. I don't wanna see you in here again.</p>
                                <p>George. George. Well, she's not doing a very good job. Kids, we're gonna have to eat this cake by ourselves, Uncle Joey didn't make parole again. I think it would be nice, if you all dropped him a line. Hey, George, buddy, you weren't at school, what have you been doing all day? Of course not, Biff, now I wouldn't want that to happen. Now, uh, I'll finish those reports up tonight, and I'll run em them on over first thing tomorrow, alright?</p>
                                <CTabs>
                                    
                                    <CTab title="Request">
                                       <prism language="http" :code="request"></prism>
                                    </CTab>
                                    <CTab title="Response">
                                        <prism language="json" :code="response"></prism>
                                    </CTab>
                                    <CTab title="Best Fix">
                                       <div style="padding:14px"><p>It is this testers opinion that the following items should be applied to fix this issue:</p>
                                        <ul>
                                            <li>Do the needful</li>
                                            <li>Consult OWASP</li>
                                            <li>Sanatize your inputs</li>
                                            <li>Input/Output encoding...</li>
                                        </ul></div>
                                    </CTab>
                                    <CTab title="References">
                                        <div style="padding:14px"><ul>
                                            <li><a href="https://owasp.org/www-project-top-ten/OWASP_Top_Ten_2017/Top_10-2017_A1-Injection" target="_blank">https://owasp.org/www-project-top-ten/OWASP_Top_Ten_2017/Top_10-2017_A1-Injection</a></li>
                                            <li>https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html</li>
                                        </ul>
                                        </div>
                                    </CTab>
                                    <CTab title="Attachments">
                                        <div stlye="padding: 14px;">None</div>
                                    </CTab>
                                </CTabs></CCollapse>  
                                <hr>
                                <CDropdown 
                    color="secondary"
                    toggler-text="Options"
                    style="float:right"
                    size="sm"
                >
                    <CDropdownHeader>Status</CDropdownHeader>
                    <CDropdownItem>Open</CDropdownItem>
                    <CDropdownItem>Validation</CDropdownItem>
                    <CDropdownItem>Fix Verified</CDropdownItem>
                    <CDropdownDivider/>
                    <CDropdownItem>Close</CDropdownItem>
                </CDropdown><CButton color="secondary" size="sm" style="float:right; margin-right:5px;" v-on:click="collapse['b'] = !collapse['b']">View</CButton><CButton disabled color="primary" size="sm" style="float: right; margin-right: 5px;">Status: Open</CButton>
                
                                <CButton color="danger" size="sm" style="float: right; margin-right: 5px;">Critical</CButton>&nbsp;<h3 >
                                    CSRF in Edit Password modal window</h3>
                                <CCollapse :show="collapse['b']" ><b>URI:</b> http://penman.io/dashboard<br><br>
                                <li style="display: inline; margin-right: 2px;"><CButton color="dark" size="sm">OWASP: A1</CButton></li><li style="display: inline; margin-right: 2px;"><CButton color="dark" size="sm">CWE-79: Type 1</CButton></li><li style="display: inline; margin-right: 2px;"><CButton color="dark" size="sm">MITRE: T1189</CButton></li><br><br>
                                <p>I don't wanna see you in here again. Right, <code class="language-http">alert('xss');</code> gimme a Pepsi free. No, fine, no , good, fine, good. Oh. Yeah, he's right here.</p>
                                <p>Breakfast. Excuse me. whoa, this is it, this is the <code class="language-http">onmouseover="javascript:alert('xss');"</code> part coming up, Doc. Yeah, I think it's a major embarrassment having an uncle in prison. I don't wanna see you in here again.</p>
                                <p>George. George. Well, she's not doing a very good job. Kids, we're gonna have to eat this cake by ourselves, Uncle Joey didn't make parole again. I think it would be nice, if you all dropped him a line. Hey, George, buddy, you weren't at school, what have you been doing all day? Of course not, Biff, now I wouldn't want that to happen. Now, uh, I'll finish those reports up tonight, and I'll run em them on over first thing tomorrow, alright?</p>
                                <CTabs>
                                    
                                    <CTab title="Request">
                                       <prism language="http" :code="request"></prism>
                                    </CTab>
                                    <CTab title="Response">
                                        <prism language="json" :code="response"></prism>
                                    </CTab>
                                    <CTab title="Best Fix">
                                       <div style="padding:14px"><p>It is this testers opinion that the following items should be applied to fix this issue:</p>
                                        <ul>
                                            <li>Do the needful</li>
                                            <li>Consult OWASP</li>
                                            <li>Sanatize your inputs</li>
                                            <li>Input/Output encoding...</li>
                                        </ul></div>
                                    </CTab>
                                    <CTab title="References">
                                        <div style="padding:14px"><ul>
                                            <li><a href="https://owasp.org/www-project-top-ten/OWASP_Top_Ten_2017/Top_10-2017_A1-Injection" target="_blank">https://owasp.org/www-project-top-ten/OWASP_Top_Ten_2017/Top_10-2017_A1-Injection</a></li>
                                            <li>https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html</li>
                                        </ul>
                                        </div>
                                    </CTab>
                                    <CTab title="Attachments">
                                        <div stlye="padding: 14px;">None</div>
                                    </CTab>
                                </CTabs></CCollapse>          
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CCol>
            <CCol col="4">
                <CCard class="shadow-sm">
                    <CCardHeader>
                        <b>Meta Info</b>
                    </CCardHeader>
                    <CCardBody>
                        <CRow>
                            <CCol col>                                
                                <b>Date Created:</b> {{project.created_at | moment('LLLL')}}<br>
                                <b>Last updated:</b> {{project.modified_at | moment('from', 'now')}}<br>
                                <b>Tester:</b> Netsurge (Brian Carroll)<br>
                            </CCol>
                        </CRow>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    </CCol>
</CRow>
</template>

<script>
import Prism from 'vue-prismjs'
import 'prismjs/themes/prism-okaidia.css'

export default {
    name: 'ProjectDetails',
    components: {
        Prism
    },
    data() {
        return {
            uuid: this.$route.params.uuid,
            project: {},
            loading: true,
            collapse: {
                'a': false,
                'b': false
            },
            description: "",
            request: `GET /organization HTTP/1.1
Host: localhost:5000
Connection: keep-alive
Accept: application/json, text/plain, */*
Authorization: Bearer REDACTED
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36
Origin: http://localhost:8080
Sec-Fetch-Site: same-site
Sec-Fetch-Mode: cors
Sec-Fetch-Dest: empty
Referer: http://localhost:8080/
Accept-Encoding: gzip, deflate, br
Accept-Language: en-US,en;q=0.9`,
            response: `[
    {
        "uuid": "3f7a3066-ee97-4167-8442-a67e6eb0d288",
        "name": "01Security",
        "description": "Awesome security consultants",
        "status": null,
        "url": "https://www.zeroonesecurity.com",
        "self": "http://localhost:5000/organization/3f7a3066-ee97-4167-8442-a67e6eb0d288",
        "total_projects": 7,
        "tags": []
    }
]`
        }
    },
    created() {
        this.$store.dispatch('getProject', this.$route.params.uuid).then(resp => {
            this.project = resp.data
            this.loading = false
        })        
    },
    mounted() {
        Prism.highlightAll()
    },
    methods: {
        hideAll() {
            for(let c in this.collapse) {
                this.collapse[c] = !this.collapse[c]
            }
        }
    }
}
</script>

