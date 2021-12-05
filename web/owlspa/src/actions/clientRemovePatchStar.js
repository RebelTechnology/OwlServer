const clientRemovePatchStar = ({star, patchSeoName}) => {
  return {
    type: 'CLIENT_REMOVE_PATCH_STAR',
    star,
    patchSeoName
  }
}

export default clientRemovePatchStar;
