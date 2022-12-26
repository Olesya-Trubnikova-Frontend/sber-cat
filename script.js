
const cat = document.querySelector(".card");

const $modalWr = document.querySelector("[data-modalWr]");

const $modalContent = document.querySelector("[data-modalContent]");

const $catCreateFormTemplate = document.getElementById("createCatForm");

const CREATE_FORM_LS_KEY = "CREATE_FORM_LS_KEY";

const $infoCat = document.forms.infoCat;

const $infoWr = document.querySelector("[data-infoWr]");

const $infoContent = document.querySelector("[data-infoContent]");

const getCreateCatFormHTML = () => `
  <button type="button" class="button__close">x</button>
	<h3 class="modal__text">Create new cat</h3>
			<form name="createCatForm">

				<div class="md">
					<input type="number" name="id" placeholder="Id" required class="form__control"></input>
				</div>

				<div class="md">
					<input type="text" name="name" placeholder="Name" required class="form__control"></input>
				</div>

				<div class="md">
					<input type="number" name="age" placeholder="Age" class="form__control"></input>
				</div>

				<div class="md">
					<input type="text" name="description" placeholder="Description" class="form__control"></input>
				</div>

				<div class="md">
					<input type="text" name="image" placeholder="Image url" class="form__control"></input>
				</div>

				<div class="md">
					<input type="range" class="form__rate" name="rate" min="1" max="10"></input>
				</div>

				<div class="md">
					<input type="checkbox" name="favorite" class="form__check" id="exampleCheck"></input>
					<label class="form__label-check" for="exampleCheck">Favorite</label>
				</div>

				<button type="submit" class="form__btn">Add</button>

			</form>
`;

const ACTIONS = {
	DETAIL: "detail",
	DELETE: "delete",
	EDIT: "edit",
}


// Отображение котов
const getCat = (cats) => `
	  <div data-cat-id="${cats.id}" class="cat">
				<img src="${cats.image}" class="cat__img" alt="">
				<div class="cat__cards">
					<h5 class="cat__title">${cats.name}</h5>
					<p class="cat__text">${cats.description}</p>
					<button data-action="${ACTIONS.DETAIL}" type="button" class="cat__btn-one">Detail</button>
					<button data-openInfo="infoCat" data-action="${ACTIONS.DELETE}" type="button" class="cat__btn-two">Delete</button>
				</div>
			</div>
	`;

fetch("https://cats.petiteweb.dev/api/single/olesya-trubnikova-frontend/show/")
.then((res) => res.json())
.then((data) => {
	
	cat.insertAdjacentHTML("afterbegin", data.map(cats => getCat(cats)).join(""))
})


// Удаление котов
cat.addEventListener("click", (e) => {
	if (e.target.dataset.action === ACTIONS.DELETE) {

		const catWr = e.target.closest("[data-cat-id]")
		const catId = catWr.dataset.catId

		console.log({catId})

		fetch(`https://cats.petiteweb.dev/api/single/olesya-trubnikova-frontend/delete/${catId}`, 
		{method: "DELETE"})
		.then((res) => {
			if (res.status === 200) {
				return catWr.remove()
			}
			alert (`Удаление кота с id = ${catId} не удалось`)
		})
	}
})


// Создание нового кота
const formatCreateFormData = (formDataObj) => ({
  ...formDataObj,
  id: +formDataObj.id,
  rate: +formDataObj.rate,
  age: +formDataObj.age,
  favorite: !!formDataObj.favorite,
});

const submitCreateCatHandler = (e) => {
	e.preventDefault();

let formDataObj = formatCreateFormData(Object.fromEntries(new FormData(e.target).entries()));

      fetch(
        "https://cats.petiteweb.dev/api/single/olesya-trubnikova-frontend/add/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formDataObj),
        }
      )
        .then((res) => {
          if (res.status === 200) {
            return cat.innerAdjacentHTML("afterbegin", getCat(formDataObj));
          }
          throw Error("Ошибка при создании кота");
        })
        .catch(alert);
    }

const clickModalWrHandler = (e) => {
	if(e.target === $modalWr) {
		$modalWr.classList.add("hidden");
		$modalWr.removeEventListener("click", clickModalWrHandler);
	}
}

const openModalHandler = (e) => {
	const targetModelName = e.target.dataset.openmodal;

	if (targetModelName === "createCat") {
    $modalWr.classList.remove("hidden")
		$modalWr.addEventListener("click", clickModalWrHandler)
		$modalContent.insertAdjacentHTML("afterbegin", getCreateCatFormHTML())
		
		const createCatForm = document.forms.createCatForm;

		const fromDataLS = localStorage.getItem(CREATE_FORM_LS_KEY);

		const preparedDataFromLS = fromDataLS && JSON.parse(fromDataLS);
		
		if(preparedDataFromLS) {
			Object.keys(preparedDataFromLS).forEach((key) => {
				createCatForm[key].value = preparedDataFromLS[key]
			})
		}

		createCatForm.addEventListener("click", submitCreateCatHandler)
		createCatForm.addEventListener("change", (changeEvent) => {
		const formatData = formatCreateFormData(Object.fromEntries
			(new FormData(createCatForm).entries()));

			localStorage.setItem(CREATE_FORM_LS_KEY, JSON.stringify(formatData));
		})
  }
}


// Модальное окно с инфой кота
const infoModalCat = (e) => {
  if (e.target.dataset.action === ACTIONS.DETAIL) {
		$infoWr.classList.remove("hidden");
    $infoWr.addEventListener("submit", clickModalWrHandler);

		const catWr = e.target.closest("[data-cat-id]");
    const catId = catWr.dataset.catId;
		fetch(`https://cats.petiteweb.dev/api/single/olesya-trubnikova-frontend/show/${catId}`)
		.then((res) => res.json())
		.then((data) => {
			$infoContent.insertAdjacentHTML(
        "afterbegin",
        `
				<button type="button" class="btn__close">x</button>
				<br>
				<img class="info__img" src="${data.image}" alt="">
	       <p data-cat-id="${cat.id}" class="info__id">Id: ${data.id}</p>
         <p class="info__name">Имя: ${data.name}</p>
		     <p class="info__age" contentEditable="true">Возраст: ${data.age}</p>
		     <p class="info__text" contentEditable="true">Описание: ${data.description}</p>
		     <p class="info__rate" contentEditable="true">Рейтинг: ${data.rate}</p>
	   	   <button data-action="${ACTIONS.EDIT}" type="button"   	class="info__btn">Edit</button>
				`
      );
		})
  }
};


// Редактирование информации о коте
const infoCat = document.querySelector(".info__cat");
infoCat.addEventListener("click", (e) => {
  if (e.target.dataset.action === ACTIONS.EDIT) {

		const catAge = document.querySelector(".info__age");
    const catText = document.querySelector(".info__text");
    const catRate = document.querySelector(".info__rate");

		const dataCat = {
      AGE: catAge.innerHTML,
      TEXT: catText.innerHTML,
      RATE: catRate.innerHTML,
    };

		console.log(dataCat.AGE);
    console.log(dataCat.TEXT);
    console.log(dataCat.RATE);

		const catWr = e.target.closest("[data-cat-id]");
    const catId = catWr.dataset.catId;

    console.log({ catId })

		fetch(
      `https://cats.petiteweb.dev/api/single/olesya-trubnikova-frontend/show/${catId}`,
        { method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(),
        }
      )
        .then((res) => {
          if (res.status === 200) {
            return cat.innerAdjacentHTML("afterbegin", getCat(formDataObj));
          }
          throw Error("Ошибка при редактировании кота с id = ${catId}");
        })
        .catch(alert);
			}
})



  // Закрытие формы на крестик
  $infoWr.addEventListener("click", (e) => {
    if (e.target.closest(".btn__close")) {
      $infoWr.classList.add("hidden");
      $infoWr.removeEventListener("click", infoModalCat);
      $infoContent.innerHTML = "";
    }
  });

$modalWr.addEventListener("click", (e) => {
  if (e.target.closest(".button__close")) {
    $modalWr.classList.add("hidden");
    $modalWr.removeEventListener("click", clickModalWrHandler);
    $modalContent.innerHTML = "";
  }
});
	
		
document.addEventListener("click", openModalHandler);
document.addEventListener("click", infoModalCat);

document.addEventListener("keydown", (e) => {

	// Закрытие формы по Esc
	if(e.key === "Escape") {
		$modalWr.classList.add("hidden");
		$modalWr.removeEventListener("click", clickModalWrHandler);
		$modalContent.innerHTML = "";

		$infoWr.classList.add("hidden");
    $infoWr.removeEventListener("click", infoModalCat);
    $infoContent.innerHTML = "";
	}
})

