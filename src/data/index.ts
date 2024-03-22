export const DEFAULT_CATEGORIES = [{id:"TEXT", name: "Texto"}, {id:"IMAGE", name: "Imagenes"}, {id:"VIDEO_URL", name: "Videos Youtube", include_external_url: true}];

export const DEFAULT_TOPICS = [
    {
        "slug": "ciencias",
        "created_by" :"root",
        "content_types": ["IMAGE", "TEXT", "VIDEO_URL"],
        "name":"Ciencias",
        "image_url": "https://www.definicion.co/wp-content/uploads/2015/04/Dentro-de-las-Ciencias-Naturales-hay-distintas-ramas1.jpg"
    },
    {
        "slug": "mates",
        "created_by" :"root",
        "content_types": ["TEXT", "VIDEO_URL"],
        "name":"Matemáticas",
        "image_url": "https://img.freepik.com/vector-premium/ilustracion-doodle-matematicas-estilo-dibujado-mano-color_288411-1179.jpg"
    },
    {
        "slug": "deportes",
        "created_by" :"root",
        "content_types": ["VIDEO_URL"],
        "name":"Deportes",
        "image_url": "https://www.gob.mx/cms/uploads/article/main_image/22672/DEPORTES-01.jpg"
    }
];