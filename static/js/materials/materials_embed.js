async function materialsEmbedMain(){
    const request = await materialsAPIGetAll(2)
    if (request.status === 200){
        materialsAllSet = request.response
        materialsEmbedShow(materialsAllSet)
    }
    materialsEmbedModalAddButton.addEventListener("click", async function () {
        switch (materialEmbedAction){
            case "addToLesson":
                const request = await lessonsAPIAddMaterials(new FormData(materialsEmbedModalTableForm), lessonID)
                if (request.status === 200){
                    bsMaterialsEmbedModal.hide()
                    showToast("Добавлено","Материалы успешно прикреплены")
                    materialsEmbedReset()
                } else {
                    bsMaterialsEmbedModal.hide()
                    showToast("Ошибка","На сервере произошла ошибка. Попробуйте обновить страницу или позже")
                    materialsEmbedReset()
                }
                break
            case "addToHW":
                HWNewMaterialsSet = new FormData(materialsEmbedModalTableForm).getAll("material")
                HWNewMaterialsList.innerHTML = `
                    <li class="list-group-item"><button type="button" class="btn btn-danger btn-sm me-2" id="HWNewMaterialsListClearButton"><i class="bi bi-trash3"></i></button>
                        Прикреплено ${HWNewMaterialsSet.length}
                    </li>`
                HWNewMaterialsList.querySelector("#HWNewMaterialsListClearButton").addEventListener("click", function () {
                    HWNewMaterialsSet = []
                    HWNewMaterialsList.innerHTML = '<li class="list-group-item">Материалы не прикреплены</li>'
                })
                bsMaterialsEmbedModal.hide()
                materialsEmbedReset()
                break
            case "addToHW_":
                HWAddMaterialsSet = new FormData(materialsEmbedModalTableForm).getAll("material")
                HWAddMaterialsList.innerHTML = `
                    <li class="list-group-item"><button type="button" class="btn btn-danger btn-sm me-2" id="HWNewMaterialsListClearButton"><i class="bi bi-trash3"></i></button>
                        Прикреплено ${HWAddMaterialsSet.length}
                    </li>`
                HWAddMaterialsList.querySelector("#HWNewMaterialsListClearButton").addEventListener("click", function () {
                    HWAddMaterialsSet = []
                    HWAddMaterialsList.innerHTML = '<li class="list-group-item">Материалы не прикреплены</li>'
                })
                bsMaterialsEmbedModal.hide()
                materialsEmbedReset()
                break
        }
    })
}

function materialsEmbedShow(list = materialsAllSet){
    materialsEmbedModalTableBody.innerHTML = ""
    materialsAllSet.forEach(material => {
        materialsEmbedModalTableBody.insertAdjacentHTML("beforeend", `
            <tr>
                <td><input name="material" class="form-check-input" type="checkbox" value="${material.id}" aria-label=""></td>
                <td><a href="/materials/${material.id}">${material.name}</a></td>
                <td>Категория</td>
                <td>Уровень</td>
                <td>Тип</td>
                <td><a href="/profile/${material.owner.id}">${material.owner.first_name} ${material.owner.last_name}</a></td>
            </tr>        
        `)
    })
}

function materialsEmbedReset() {
    materialsEmbedModalSearchForm.reset()
    materialsEmbedModalTableForm.reset()
}



//Bootstrap Elements
const materialsEmbedModal = document.querySelector("#MaterialsEmbedModal")
const bsMaterialsEmbedModal = new bootstrap.Modal(materialsEmbedModal)

//Search Form
const materialsEmbedModalSearchForm = materialsEmbedModal.querySelector("#MaterialsEmbedModalSearchForm")
const materialsEmbedModalSearchName = materialsEmbedModalSearchForm.querySelector("#MaterialsEmbedModalSearchName")
const materialsEmbedModalSearchOwner = materialsEmbedModalSearchForm.querySelector("#MaterialsEmbedModalSearchOwner")
const materialsEmbedModalSearchCategory = materialsEmbedModalSearchForm.querySelector("#MaterialsEmbedModalSearchCategory")
const materialsEmbedModalSearchLevel = materialsEmbedModalSearchForm.querySelector("#MaterialsEmbedModalSearchLevel")
const materialsEmbedModalSearchType = materialsEmbedModalSearchForm.querySelector("#MaterialsEmbedModalSearchType")
const materialsEmbedModalSearchClearButton = materialsEmbedModalSearchForm.querySelector("#MaterialsEmbedModalSearchClearButton")

//Materials Form
const materialsEmbedModalTableForm = materialsEmbedModal.querySelector("#MaterialsEmbedModalTableForm")
const materialsEmbedModalTableBody = materialsEmbedModalTableForm.querySelector("#MaterialsEmbedModalTableBody")

//Buttons
const materialsEmbedModalAddButton = materialsEmbedModal.querySelector("#MaterialsEmbedModalAddButton")

//Sets
let materialsSelectedSet = []
let materialsAllSet = []

materialsEmbedMain()